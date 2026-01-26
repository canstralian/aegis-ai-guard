# CLAUDE.md - AI Assistant Guide for Aegis AI Guard

## Project Overview

**Aegis AI Guard** is a DevSecOps AI Platform - a multi-tenant SaaS application for managing security findings across organizations with AI-powered triage capabilities. Built with the Lovable development platform, it combines a React frontend with Supabase backend services.

## Tech Stack

### Frontend
- **React 18.3** with TypeScript 5.8
- **Vite 5.4** - Build tool and dev server
- **Tailwind CSS 3.4** - Utility-first styling with custom theme
- **shadcn/ui** - Component library (Radix UI + Tailwind)
- **React Router 6** - Client-side routing
- **TanStack React Query 5** - Server state management
- **React Hook Form + Zod** - Form handling and validation
- **Lucide React** - Icon library
- **Recharts** - Data visualization

### Backend
- **Supabase** - PostgreSQL database, authentication, serverless functions
- **Deno** - Runtime for edge functions
- **Lovable AI Gateway** - AI inference (google/gemini-3-flash-preview, preview model)

## Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components (40+)
│   │   ├── layout/          # AppLayout, navigation components
│   │   └── [feature]/       # Feature-specific components
│   ├── pages/               # Route page components
│   ├── contexts/            # React Context providers (AuthContext)
│   ├── hooks/               # Custom hooks (useAITriage, use-mobile)
│   ├── integrations/supabase/ # Supabase client and generated types
│   ├── types/               # TypeScript type definitions
│   ├── lib/                 # Utilities (constants, cn helper)
│   └── test/                # Test setup and specs
├── supabase/
│   ├── functions/ai-triage/ # Deno edge function for AI analysis
│   └── migrations/          # SQL schema migrations
├── public/                  # Static assets
└── .github/agents/          # GitHub Copilot agent config
```

## Development Commands

```bash
npm install           # Install dependencies
npm run dev          # Start dev server (port 8080)
npm run build        # Production build
npm run lint         # Run ESLint
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
```

## Code Conventions

### Path Aliases
Use `@/` prefix for imports from `src/`:
```typescript
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
```

### Component Patterns
- **Naming**: PascalCase for components, camelCase for utilities
- **File structure**: One component per file, co-located styles
- **CSS classes**: Use `cn()` helper for conditional classes:
```typescript
import { cn } from '@/lib/utils';
<div className={cn('base-class', condition && 'conditional-class')} />
```

### TypeScript
- Types are auto-generated from Supabase schema in `src/integrations/supabase/types.ts`
- Custom database types in `src/types/database.ts`
- Note: `strictNullChecks` and `noImplicitAny` are disabled for flexibility

### Styling with Tailwind
- Dark mode via `class` strategy (default theme is dark)
- Custom severity colors: `severity-critical`, `severity-high`, `severity-medium`, `severity-low`, `severity-info`
- Custom status colors: `status-success`, `status-warning`, `status-error`, `status-info`
- Mobile-first responsive: use `sm:`, `md:`, `lg:` breakpoints

### Toast Notifications
Use Sonner for user feedback:
```typescript
import { toast } from 'sonner';
toast.success('Operation completed');
toast.error('Something went wrong');
```

## Architecture

### Authentication & Multi-tenancy
- **AuthContext** (`src/contexts/AuthContext.tsx`) provides global auth state
- Users belong to organizations with role-based access
- Roles: `org_owner`, `security_admin`, `security_analyst`, `devops_engineer`, `developer`, `auditor`
- Current org stored in localStorage (`aegis_current_org`)

### Data Fetching
- Use **React Query** for server state
- Supabase client at `@/integrations/supabase/client`
- Custom hooks encapsulate API logic (e.g., `useAITriage`)

### Routing
Protected routes wrap content in `AppLayout`:
```typescript
<Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
```

Main routes:
- `/` - Redirects to `/dashboard`
- `/auth/login`, `/auth/signup` - Authentication
- `/dashboard` - Main dashboard with KPIs
- `/findings` - Security findings list with AI triage
- `/projects`, `/assets`, `/integrations`, `/upload` - Feature pages
- `/admin/*` - Admin panels

## Key Components

### AppLayout (`src/components/layout/AppLayout.tsx`)
- Protected route wrapper with sidebar navigation
- User menu, org switcher, theme toggle

### Dashboard (`src/pages/Dashboard.tsx`)
- KPI cards (total findings, critical issues, MTTR)
- Recent findings preview

### Findings (`src/pages/Findings.tsx`)
- Main findings table with search/filter
- AI triage actions (single and batch)

### AuthContext (`src/contexts/AuthContext.tsx`)
- Provides: `user`, `session`, `profile`, `organizations`, `currentOrganization`, `currentRole`
- Methods: `signIn`, `signUp`, `signOut`, `setCurrentOrganization`

## Database Schema

### Core Tables
- **profiles** - User profile data
- **organizations** - Organization metadata
- **organization_members** - User-org membership
- **workspaces** - Collections within orgs
- **projects** - Collections within workspaces
- **assets** - Monitored resources (repos, containers, cloud)
- **findings** - Security vulnerabilities with AI analysis
- **integrations** - Connected tools (GitHub, AWS, etc.)
- **user_roles** - RBAC assignments
- **audit_logs**, **ai_activity_logs** - Compliance tracking

### Finding Fields
Key fields on `findings` table:
- `title`, `description`, `severity`, `status`, `source`
- `file_path`, `line_number`, `code_snippet` (SAST context)
- `cve_id`, `cwe_id`, `package_name`, `package_version`
- `ai_summary`, `ai_remediation`, `ai_risk_explanation` (AI-generated)
- `risk_score`, `confidence_score`, `exploitability_score`

### Enums
- **finding_severity**: `critical`, `high`, `medium`, `low`, `info`
- **finding_status**: `new`, `triaged`, `in_progress`, `resolved`, `ignored`, `false_positive`
- **finding_source**: `sast`, `sca`, `secrets`, `iac`, `container`, `cspm`, `runtime`, `manual`, `github_dependabot`, `github_code_scanning`, `github_secret_scanning`
- **app_role**: `org_owner`, `security_admin`, `security_analyst`, `devops_engineer`, `developer`, `auditor`

## AI Triage Function

The edge function at `supabase/functions/ai-triage/index.ts`:
- Analyzes security findings using Lovable AI Gateway
- Calculates risk scores based on severity and exploitability
- Updates findings with AI summary, remediation, and status
- Logs activity for audit trail

API endpoint: `POST /functions/v1/ai-triage`
- Actions: `analyze` (single finding), `triage_all` (batch)
- Handles rate limiting (429) and credit exhaustion (402)

## Testing

- **Framework**: Vitest with React Testing Library
- **Environment**: jsdom
- **Setup**: `src/test/setup.ts` mocks `matchMedia`
- **Pattern**: `**/*.{test,spec}.{ts,tsx}`

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## Environment Variables

Required in `.env`:
```
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[anon-key]
```

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Wrap with `AppLayout` for protected routes

### Adding a UI Component
1. Check if shadcn/ui has it: look in `src/components/ui/`
2. If not, create in `src/components/[feature]/`
3. Use Tailwind + `cn()` helper for styling

### Adding a Database Table
1. Create migration in `supabase/migrations/`
2. Run migration via Supabase CLI
3. Regenerate types (types auto-sync with Lovable)
4. Add TypeScript interface in `src/types/database.ts`

### Working with Findings
- Fetch via Supabase client from `findings` table
- Use `useAITriage` hook for AI analysis
- Display with severity/status badge components

## Security Considerations

- Row-Level Security (RLS) enforces data isolation
- JWT authentication via Supabase
- Never commit `.env` with real credentials
- Validate user input at system boundaries
- Audit logging for compliance

## Deployment

Via Lovable platform:
1. Open project in Lovable
2. Click Share > Publish
3. Configure custom domain in Project > Settings > Domains

## Notes for AI Assistants

1. **Read before editing**: Always read files before modifying them
2. **Use existing patterns**: Follow established conventions in the codebase
3. **Prefer edits over new files**: Extend existing components when possible
4. **Type safety**: Leverage auto-generated Supabase types
5. **Test changes**: Run `npm test` after modifications
6. **Lint check**: Run `npm run lint` before committing
7. **Don't over-engineer**: Keep changes focused and minimal
8. **Security first**: Never introduce vulnerabilities (XSS, injection, etc.)
