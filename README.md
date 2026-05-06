# Aegis AI Guard

Aegis AI Guard is a DevSecOps-oriented web application for tracking, classifying, and acting on security findings across software delivery workflows.

The current application is built as a Vite, React, TypeScript, Tailwind CSS, shadcn-ui, and Supabase project. It is in early MVP form and should be treated as a prototype until the security model, data policies, and deployment controls have been reviewed.

## Purpose

Aegis exists to make security work visible and actionable. The product loop is simple:

1. Observe signals from repositories, dependencies, application configuration, and deployment surfaces.
2. Classify findings by severity, status, ownership, and confidence.
3. Route work to a human or automated remediation path.
4. Record evidence so the system can be audited later.

## Architecture

The application currently uses:

- React and TypeScript for the client application.
- Vite for local development and production builds.
- Tailwind CSS and shadcn-ui for the interface system.
- Supabase for backend services, authentication, database access, and storage integration.
- Vitest and Testing Library for frontend tests.
- ESLint for static checks.

## Local Development

Install dependencies:

```sh
npm install
```

Create a local environment file from the example file, then fill in values from the appropriate Supabase project:

```sh
cp .env.example .env
```

Run the development server:

```sh
npm run dev
```

Run checks:

```sh
npm run lint
npm test
npm run build
```

## Environment Configuration

Local configuration must not be committed. Keep real values in local environment files or deployment platform secrets. The repository should only contain placeholder examples.

Expected client-side variables:

```sh
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

## Security Model

Aegis assumes the browser is not trusted. Client-side values can identify a project, but they must not grant broad data access by themselves.

Required controls before production use:

- Row Level Security enabled on every application table.
- Database policies scoped by user, organization, role, or explicitly public data.
- Storage buckets reviewed for public/private exposure.
- Authentication redirect URLs restricted to known environments.
- Privileged operations moved behind server-side checks.
- Logs reviewed so sensitive values are not stored in plaintext.

See `docs/supabase-audit.md` for the Supabase audit checklist.

## Product Contract

Aegis may automatically detect and report low-impact security issues such as missing documentation, dependency drift, configuration exposure, and missing CI checks.

Aegis should require explicit human approval before changing production policies, rotating credentials, deleting data, altering schemas, blocking deployments, or touching third-party systems.

## Deployment

Deployment is expected to run through Lovable or another static hosting path connected to the repository. Production values should be configured in the deployment environment, not committed to git.

## Status

This repository is in early active development. Treat findings, schemas, and automation behavior as evolving until releases and a stable security policy are published.
