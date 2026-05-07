
-- =============================================
-- 1. Revoke SELECT from anon on all app tables
--    to hide them from the public GraphQL schema
-- =============================================
REVOKE SELECT ON public.ai_activity_logs FROM anon;
REVOKE SELECT ON public.assets FROM anon;
REVOKE SELECT ON public.audit_logs FROM anon;
REVOKE SELECT ON public.deployment_gates FROM anon;
REVOKE SELECT ON public.environments FROM anon;
REVOKE SELECT ON public.finding_comments FROM anon;
REVOKE SELECT ON public.finding_correlations FROM anon;
REVOKE SELECT ON public.finding_evidence FROM anon;
REVOKE SELECT ON public.findings FROM anon;
REVOKE SELECT ON public.gate_checks FROM anon;
REVOKE SELECT ON public.github_repositories FROM anon;
REVOKE SELECT ON public.github_sync_jobs FROM anon;
REVOKE SELECT ON public.ingestion_jobs FROM anon;
REVOKE SELECT ON public.integrations FROM anon;
REVOKE SELECT ON public.organization_members FROM anon;
REVOKE SELECT ON public.organizations FROM anon;
REVOKE SELECT ON public.profiles FROM anon;
REVOKE SELECT ON public.projects FROM anon;
REVOKE SELECT ON public.user_roles FROM anon;
REVOKE SELECT ON public.workspaces FROM anon;

-- Also revoke INSERT/UPDATE/DELETE from anon for defense-in-depth
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;

-- =============================================
-- 2. Revoke EXECUTE from anon on all
--    SECURITY DEFINER functions
-- =============================================
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, uuid, app_role[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_member_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_from_project(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_from_workspace(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.seed_demo_user() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Revoke default future function execute from anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
