CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.deployment_gates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT true,
  block_on_severities TEXT[] NOT NULL DEFAULT ARRAY['critical', 'high'],
  auto_created BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id)
);
ALTER TABLE public.deployment_gates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view deployment gates" ON public.deployment_gates FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id WHERE p.id = deployment_gates.project_id AND w.organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));

CREATE POLICY "Admins can manage deployment gates" ON public.deployment_gates FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id WHERE p.id = deployment_gates.project_id AND public.has_any_role(auth.uid(), w.organization_id, ARRAY['org_owner','security_admin','devops_engineer']::public.app_role[])))
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id WHERE p.id = deployment_gates.project_id AND public.has_any_role(auth.uid(), w.organization_id, ARRAY['org_owner','security_admin','devops_engineer']::public.app_role[])));

CREATE TABLE public.gate_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('pass', 'fail')),
  blocking_finding_count INTEGER NOT NULL DEFAULT 0,
  blocking_findings_summary JSONB DEFAULT '[]'::jsonb,
  triggered_by TEXT,
  api_token_hint TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gate_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view gate checks" ON public.gate_checks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.projects p JOIN public.workspaces w ON p.workspace_id = w.id WHERE p.id = gate_checks.project_id AND w.organization_id IN (SELECT public.get_user_org_ids(auth.uid()))));

CREATE INDEX idx_gate_checks_project_id ON public.gate_checks(project_id);
CREATE INDEX idx_gate_checks_created_at ON public.gate_checks(created_at DESC);

CREATE TRIGGER update_deployment_gates_updated_at BEFORE UPDATE ON public.deployment_gates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();