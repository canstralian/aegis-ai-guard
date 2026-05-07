
-- Hide views from anon in GraphQL
REVOKE SELECT ON public.integrations_safe FROM anon;
REVOKE SELECT ON public.organization_members_public FROM anon;

-- Revoke authenticated EXECUTE on trigger-only functions
-- These are only invoked by the database engine via triggers, not by users
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.seed_demo_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at() FROM authenticated;
