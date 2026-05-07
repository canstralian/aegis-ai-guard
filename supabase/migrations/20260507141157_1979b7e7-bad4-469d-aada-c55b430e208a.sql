
-- Revoke EXECUTE from PUBLIC (the default PostgreSQL pseudo-role)
-- which anon inherits from. Then re-grant only to authenticated.

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, uuid, app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, uuid, app_role) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, uuid, app_role[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, uuid, app_role[]) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_user_org_ids(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_user_org_ids(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_org_member_ids(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_org_member_ids(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_org_from_project(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_org_from_project(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.get_org_from_workspace(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_org_from_workspace(uuid) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.seed_demo_user() FROM PUBLIC;
-- seed_demo_user is a trigger function, no direct user call needed
-- grant to postgres owner only (already has it as owner)

REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM PUBLIC;
-- trigger function, no direct call needed

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC;
-- trigger function, no direct call needed

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC;
-- trigger function, no direct call needed

-- Prevent future functions from getting PUBLIC execute by default
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;
