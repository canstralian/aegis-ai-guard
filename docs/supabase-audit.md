# Supabase Audit Checklist

Use this checklist before treating the app as production-ready.

## Database

- Confirm Row Level Security is enabled on every application table.
- Confirm read policies are scoped to the intended user, organization, or public surface.
- Confirm write policies do not trust client-provided ownership fields.
- Confirm delete policies are restricted to explicit owner or admin paths.

## Storage

- Confirm each bucket is intentionally public or private.
- Confirm upload, download, update, and delete policies are scoped.
- Confirm object paths cannot be used to cross tenant boundaries.

## Auth

- Confirm redirect URLs are restricted to known environments.
- Confirm providers match the intended product surface.
- Confirm rate limits and abuse controls are acceptable.

## Edge Functions

- Confirm functions validate the authenticated user server-side.
- Confirm privileged operations are not exposed to unauthenticated callers.
- Confirm logs avoid sensitive values.
