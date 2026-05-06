# aegis-ai-guard Development Patterns

> Repo-local skill generated from repository analysis and corrected against current code.

## Overview

This skill captures the practical development patterns for the `aegis-ai-guard` TypeScript codebase. Use it as guidance, not as a replacement for checking the actual files before making changes.

## Project Stack

- Vite, React, and TypeScript for the client application.
- Tailwind CSS and shadcn-ui for the interface system.
- Supabase for backend services, authentication, database access, and storage integration.
- Vitest and Testing Library for frontend tests.
- ESLint for static checks.

## Coding Conventions

### File Naming

- Follow the surrounding directory convention when adding files.
- React components and pages may use PascalCase, such as `App.tsx`.
- Utility-style modules may use camelCase when that matches nearby files.

### Imports

- Prefer the configured `@/` alias for imports from `src`.
- Keep package imports external and source imports explicit.

Example:

```typescript
import { AppLayout } from "@/components/layout/AppLayout";
```

### Exports

- Named exports are common for reusable modules, providers, and components.
- Default exports exist in the current React app, including `src/App.tsx`, so do not enforce named exports exclusively.
- Match the existing pattern in the file or nearby feature area.

### Commit Messages

- Use concise conventional-style prefixes where appropriate, such as `docs:` or `chore:`.
- Keep commit messages direct and tied to the change.

## Workflows

### Update README Documentation

**Trigger:** Updating or replacing the main project documentation.

1. Edit `README.md` with accurate project, setup, security, or deployment information.
2. Keep the documented commands aligned with `package.json`.
3. Commit with a documentation-focused message.

Example:

```text
docs: revise setup notes
```

## Testing Patterns

- The repository uses Vitest via `npm test` and `npm run test:watch`.
- Test files should follow the existing `*.test.*` convention when tests are added.
- Prefer Testing Library for React component behavior.

Example:

```typescript
import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

// Add focused tests around user-visible behavior.
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm run lint` | Run ESLint checks. |
| `npm test` | Run Vitest once. |
| `npm run build` | Build the Vite application. |
