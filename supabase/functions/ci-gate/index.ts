import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Support both Bearer token auth (from UI) and API-key auth (from CI)
    const authHeader = req.headers.get("Authorization");
    const apiKey = req.headers.get("X-Gate-Token");
    let userId: string | null = null;
    let triggeredBy = "api";

    if (authHeader?.startsWith("Bearer ")) {
      const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user }, error } = await supabaseUser.auth.getUser();
      if (error || !user) {
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      userId = user.id;
      triggeredBy = `user:${user.email || user.id}`;
    } else if (apiKey) {
      // Validate API key against project settings
      // For now, accept any non-empty key and log the hint
      triggeredBy = `ci:token:...${apiKey.slice(-4)}`;
    } else {
      return new Response(
        JSON.stringify({ error: "Missing authorization. Use Bearer token or X-Gate-Token header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: { project_id?: string; project_slug?: string };
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { project_id, project_slug } = body;

    if (!project_id && !project_slug) {
      return new Response(
        JSON.stringify({ error: "project_id or project_slug is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (project_id && !isUuid(project_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid project_id format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Resolve project
    let resolvedProjectId = project_id;
    if (!resolvedProjectId && project_slug) {
      const { data: project, error } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("slug", project_slug)
        .maybeSingle();
      if (error || !project) {
        return new Response(
          JSON.stringify({ error: "Project not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      resolvedProjectId = project.id;
    }

    // Get gate configuration
    const { data: gate } = await supabaseAdmin
      .from("deployment_gates")
      .select("*")
      .eq("project_id", resolvedProjectId)
      .maybeSingle();

    // If no gate configured, default to checking critical + high
    const enabled = gate?.enabled ?? true;
    const blockOnSeverities: string[] = gate?.block_on_severities ?? ["critical", "high"];

    if (!enabled) {
      const result = {
        status: "pass",
        message: "CI gate is disabled for this project",
        gate_enabled: false,
        blocking_findings: [],
        checked_at: new Date().toISOString(),
      };

      // Log the check
      await supabaseAdmin.from("gate_checks").insert({
        project_id: resolvedProjectId,
        status: "pass",
        blocking_finding_count: 0,
        blocking_findings_summary: [],
        triggered_by: triggeredBy,
        api_token_hint: apiKey ? apiKey.slice(-4) : null,
      });

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Query unresolved findings with blocking severities
    const { data: blockingFindings, error: findingsError } = await supabaseAdmin
      .from("findings")
      .select("id, title, severity, source, status, created_at, file_path, cve_id")
      .eq("project_id", resolvedProjectId)
      .in("severity", blockOnSeverities)
      .not("status", "in", '("resolved","ignored","false_positive")')
      .order("severity", { ascending: true })
      .limit(100);

    if (findingsError) {
      console.error("Failed to query findings:", findingsError);
      return new Response(
        JSON.stringify({ error: "Failed to check findings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const findings = blockingFindings || [];
    const status = findings.length === 0 ? "pass" : "fail";

    const summary = findings.map((f) => ({
      id: f.id,
      title: f.title,
      severity: f.severity,
      source: f.source,
      status: f.status,
      cve_id: f.cve_id,
      file_path: f.file_path,
    }));

    // Log the check
    await supabaseAdmin.from("gate_checks").insert({
      project_id: resolvedProjectId,
      status,
      blocking_finding_count: findings.length,
      blocking_findings_summary: summary,
      triggered_by: triggeredBy,
      api_token_hint: apiKey ? apiKey.slice(-4) : null,
    });

    const result = {
      status,
      message:
        status === "pass"
          ? "No blocking security findings detected. Deployment is allowed."
          : `Deployment blocked: ${findings.length} unresolved ${blockOnSeverities.join("/")} finding(s) detected.`,
      gate_enabled: true,
      block_on_severities: blockOnSeverities,
      blocking_finding_count: findings.length,
      blocking_findings: summary,
      checked_at: new Date().toISOString(),
      project_id: resolvedProjectId,
    };

    // Return 200 for pass, 403 for fail (CI pipelines can check exit code)
    return new Response(JSON.stringify(result), {
      status: status === "pass" ? 200 : 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CI Gate error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
