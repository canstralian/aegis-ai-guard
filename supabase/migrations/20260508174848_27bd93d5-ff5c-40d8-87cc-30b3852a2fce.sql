-- This app uses PostgREST (supabase-js) only; GraphQL is not used.
-- Disable GraphQL endpoint for both anon and authenticated to eliminate
-- schema discoverability of all tables/views via /graphql/v1.

REVOKE USAGE ON SCHEMA graphql_public FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION graphql_public.graphql(text, text, jsonb, jsonb) FROM anon, authenticated, public;
REVOKE USAGE ON SCHEMA graphql FROM anon, authenticated, public;