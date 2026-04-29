import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_ANALYSES_PER_HOUR = 20;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

interface Finding {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  source: string;
  status: string;
  file_path: string | null;
  line_number: number | null;
  code_snippet: string | null;
  cwe_id: string | null;
  cve_id: string | null;
  package_name: string | null;
  package_version: string | null;
  project_id: string;
  confidence_score: number | null;
  exploitability_score: number | null;
}

interface TriageRequest {
  finding_id?: string;
  finding_ids?: string[];
  action: "analyze" | "triage_all";
}

interface AIAnalysis {
  risk_score: number;
  summary: string;
  remediation: string;
  risk_explanation: string;
  suggested_status: string;
  priority_rank: number;
}

// Calculate base risk score from severity
function getSeverityScore(severity: string): number {
  const scores: Record<string, number> = {
    critical: 95,
    high: 75,
    medium: 50,
    low: 25,
    info: 10,
  };
  return scores[severity] || 50;
}

// Calculate exploitability factor
function getExploitabilityFactor(finding: Finding): number {
  let factor = 1.0;
  
  // CVE presence increases exploitability
  if (finding.cve_id) factor += 0.2;
  
  // Known vulnerable packages are more exploitable
  if (finding.package_name && finding.package_version) factor += 0.1;
  
  // Code-level findings with file paths are more actionable
  if (finding.file_path) factor += 0.05;
  
  return Math.min(factor, 1.5);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase clients
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseUser = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let body: TriageRequest;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid JSON body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const { finding_id, finding_ids, action } = body;

    if (action !== "analyze" && action !== "triage_all") {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (finding_id && !isUuid(finding_id)) {
      return new Response(
        JSON.stringify({ error: "Invalid finding_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (finding_ids && (!Array.isArray(finding_ids) || finding_ids.some((id) => !isUuid(id)))) {
      return new Response(
        JSON.stringify({ error: "Invalid finding_ids" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`AI Triage request: action=${action}, user=${user.id}`);

    // Per-user rate limiting (defense-in-depth)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count: recentCount, error: rateLimitError } = await supabaseAdmin
      .from("ai_activity_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("action", "ai_triage")
      .gte("created_at", oneHourAgo);

    if (rateLimitError) {
      console.error("Rate limit query error:", rateLimitError);
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if ((recentCount ?? 0) >= MAX_ANALYSES_PER_HOUR) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Get findings to analyze
    let findings: Finding[] = [];
    
    if (action === "analyze" && finding_id) {
      // Explicit access check (RLS already helps, but fail closed with a clear 403)
      const { data: accessRow, error: accessError } = await supabaseUser
        .from("findings")
        .select("id")
        .eq("id", finding_id)
        .maybeSingle();

      if (accessError || !accessRow) {
        return new Response(
          JSON.stringify({ error: "Finding not found or access denied" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      // Single finding analysis
      const { data, error } = await supabaseUser
        .from("findings")
        .select("*")
        .eq("id", finding_id)
        .single();
      
      if (error) throw new Error(`Finding not found: ${error.message}`);
      findings = [data];
    } else if (action === "triage_all" || finding_ids) {
      // Batch analysis
      let query = supabaseUser
        .from("findings")
        .select("*")
        .is("ai_analyzed_at", null);
      
      if (finding_ids && finding_ids.length > 0) {
        query = query.in("id", finding_ids);
      }
      
      const { data, error } = await query.limit(50);
      if (error) throw new Error(`Failed to fetch findings: ${error.message}`);
      findings = data || [];
    }

    if (findings.length === 0) {
      return new Response(
        JSON.stringify({ message: "No findings to analyze", analyzed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Enforce hourly cap even for batches
    if ((recentCount ?? 0) + findings.length > MAX_ANALYSES_PER_HOUR) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Max ${MAX_ANALYSES_PER_HOUR} analyses per hour. Try a smaller batch later.`,
        }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Analyzing ${findings.length} findings`);

    // Process findings with AI
    const results = [];
    
    for (const finding of findings) {
      try {
        const analysis = await analyzeWithAI(finding, lovableApiKey);
        
        // Update finding with AI analysis
        const { error: updateError } = await supabaseAdmin
          .from("findings")
          .update({
            ai_summary: analysis.summary,
            ai_remediation: analysis.remediation,
            ai_risk_explanation: analysis.risk_explanation,
            risk_score: analysis.risk_score,
            ai_analyzed_at: new Date().toISOString(),
            status: finding.status === "new" ? analysis.suggested_status : finding.status,
          })
          .eq("id", finding.id);

        if (updateError) {
          console.error(`Failed to update finding ${finding.id}:`, updateError);
          continue;
        }

        // Log AI activity
        const { data: project } = await supabaseAdmin
          .from("projects")
          .select("workspace_id")
          .eq("id", finding.project_id)
          .single();

        if (project) {
          const { data: workspace } = await supabaseAdmin
            .from("workspaces")
            .select("organization_id")
            .eq("id", project.workspace_id)
            .single();

          if (workspace) {
            await supabaseAdmin.from("ai_activity_logs").insert({
              organization_id: workspace.organization_id,
              user_id: user.id,
              finding_id: finding.id,
              action: "ai_triage",
              model_used: "google/gemini-3-flash-preview",
              response_summary: `Risk score: ${analysis.risk_score}, Status: ${analysis.suggested_status}`,
            });
          }
        }

        results.push({
          finding_id: finding.id,
          success: true,
          analysis,
        });

        console.log(`Analyzed finding ${finding.id}: risk_score=${analysis.risk_score}`);
      } catch (error) {
        console.error(`Failed to analyze finding ${finding.id}:`, error);
        results.push({
          finding_id: finding.id,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({
        message: `Analyzed ${successCount} of ${findings.length} findings`,
        analyzed: successCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("AI Triage error:", error);
    
    if (error instanceof Error && error.message.includes("Rate limit")) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function analyzeWithAI(finding: Finding, apiKey: string): Promise<AIAnalysis> {
  const baseRiskScore = getSeverityScore(finding.severity);
  const exploitabilityFactor = getExploitabilityFactor(finding);
  
  const systemPrompt = `You are an expert security analyst specializing in DevSecOps. Your task is to analyze security findings and provide actionable triage recommendations.

You must respond with a JSON object containing:
- summary: A concise 1-2 sentence summary of the vulnerability and its impact
- remediation: Specific, actionable steps to fix the issue (include code examples when relevant)
- risk_explanation: Explanation of why this risk score was assigned, considering exploitability, impact, and context
- suggested_status: One of "triaged", "in_progress", or "new" based on severity and actionability
- priority_rank: 1-10 scale (1 = fix immediately, 10 = low priority)

Consider these factors:
- Severity level and potential impact
- Exploitability (is there a known CVE? Active exploitation?)
- Context (file path, code location, package dependencies)
- Remediation complexity`;

  const userPrompt = `Analyze this security finding:

Title: ${finding.title}
Description: ${finding.description || "No description provided"}
Severity: ${finding.severity}
Source: ${finding.source}
${finding.cve_id ? `CVE: ${finding.cve_id}` : ""}
${finding.cwe_id ? `CWE: ${finding.cwe_id}` : ""}
${finding.file_path ? `File: ${finding.file_path}${finding.line_number ? `:${finding.line_number}` : ""}` : ""}
${finding.package_name ? `Package: ${finding.package_name}@${finding.package_version || "unknown"}` : ""}
${finding.code_snippet ? `Code Snippet:\n\`\`\`\n${finding.code_snippet}\n\`\`\`` : ""}

Base risk score from severity: ${baseRiskScore}
Exploitability factor: ${exploitabilityFactor.toFixed(2)}

Provide your analysis as a JSON object.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded");
    }
    if (response.status === 402) {
      throw new Error("Payment required - please add credits to your Lovable AI workspace");
    }
    const errorText = await response.text();
    console.error("AI gateway error:", response.status, errorText);
    throw new Error(`AI gateway error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    throw new Error("Empty response from AI");
  }

  // Parse JSON from response (handle markdown code blocks)
  let analysisJson: Partial<AIAnalysis>;
  try {
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();
    analysisJson = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error("Failed to parse AI response:", content);
    // Fallback to basic analysis
    analysisJson = {
      summary: `${finding.severity.toUpperCase()} severity ${finding.source} finding that requires review.`,
      remediation: "Review the finding details and apply appropriate security controls.",
      risk_explanation: `Assigned based on ${finding.severity} severity with exploitability factor of ${exploitabilityFactor.toFixed(2)}.`,
      suggested_status: finding.severity === "critical" || finding.severity === "high" ? "triaged" : "new",
      priority_rank: finding.severity === "critical" ? 1 : finding.severity === "high" ? 3 : 5,
    };
  }

  // Calculate final risk score
  const priorityAdjustment = analysisJson.priority_rank 
    ? (10 - analysisJson.priority_rank) * 2 
    : 0;
  const finalRiskScore = Math.min(100, Math.round(baseRiskScore * exploitabilityFactor + priorityAdjustment));

  return {
    risk_score: finalRiskScore,
    summary: analysisJson.summary || "Security finding requires review.",
    remediation: analysisJson.remediation || "Apply appropriate security controls.",
    risk_explanation: analysisJson.risk_explanation || "Risk score based on severity and exploitability.",
    suggested_status: analysisJson.suggested_status || "triaged",
    priority_rank: analysisJson.priority_rank || 5,
  };
}
