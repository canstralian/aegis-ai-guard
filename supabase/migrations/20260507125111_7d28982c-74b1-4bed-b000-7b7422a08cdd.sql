
-- Revoke anon from the integrations_safe view
REVOKE ALL ON public.integrations_safe FROM anon;

-- Revoke EXECUTE on handle_new_user from anon (trigger function, not meant for API)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon;

-- Also revoke all public schema default privileges for functions from anon
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
