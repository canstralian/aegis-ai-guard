
-- =========================================================
-- REVOKE anon SELECT on ALL application tables
-- This hides them from GraphQL/PostgREST introspection for unauthenticated users
-- =========================================================

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
REVOKE SELECT ON public.integrations_safe FROM anon;

-- Also revoke INSERT/UPDATE/DELETE from anon on all tables (belt-and-suspenders)
REVOKE INSERT, UPDATE, DELETE ON public.ai_activity_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.assets FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.deployment_gates FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.environments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.finding_comments FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.finding_correlations FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.finding_evidence FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.findings FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.gate_checks FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.github_repositories FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.github_sync_jobs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.ingestion_jobs FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.integrations FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.organization_members FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.organizations FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.projects FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM anon;
REVOKE INSERT, UPDATE, DELETE ON public.workspaces FROM anon;

-- =========================================================
-- REVOKE EXECUTE on SECURITY DEFINER functions from anon
-- These are internal helpers used by RLS policies, not meant for direct API calls
-- =========================================================

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, uuid, app_role) FROM anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, uuid, app_role[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_user_org_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_member_ids(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_from_project(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_org_from_workspace(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM anon;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon;

-- =========================================================
-- Prevent future tables from inheriting default anon grants
-- =========================================================

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE SELECT ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE UPDATE ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE DELETE ON TABLES FROM anon;
