-- =============================================================
-- AEGIS DEVSECOPS AI - DATABASE SCHEMA
-- Multi-tenant architecture with RBAC and Row-Level Security
-- =============================================================

-- =====================
-- ENUMS
-- =====================

-- Application roles enum
CREATE TYPE public.app_role AS ENUM (
  'org_owner',
  'security_admin', 
  'security_analyst',
  'devops_engineer',
  'developer',
  'auditor'
);

-- Finding severity levels
CREATE TYPE public.finding_severity AS ENUM (
  'critical',
  'high',
  'medium',
  'low',
  'info'
);

-- Finding status lifecycle
CREATE TYPE public.finding_status AS ENUM (
  'new',
  'triaged',
  'in_progress',
  'resolved',
  'ignored',
  'false_positive'
);

-- Finding source types
CREATE TYPE public.finding_source AS ENUM (
  'sast',
  'sca',
  'secrets',
  'iac',
  'container',
  'cspm',
  'runtime',
  'manual',
  'github_dependabot',
  'github_code_scanning',
  'github_secret_scanning'
);

-- Asset types
CREATE TYPE public.asset_type AS ENUM (
  'repository',
  'container_image',
  'cloud_resource',
  'kubernetes_workload',
  'api_endpoint'
);

-- Integration types
CREATE TYPE public.integration_type AS ENUM (
  'github',
  'gitlab',
  'aws',
  'gcp',
  'azure',
  'kubernetes'
);

-- Integration status
CREATE TYPE public.integration_status AS ENUM (
  'connected',
  'disconnected',
  'error',
  'syncing'
);

-- Audit event types
CREATE TYPE public.audit_event_type AS ENUM (
  'auth_login',
  'auth_logout',
  'auth_failed',
  'user_invited',
  'user_removed',
  'role_changed',
  'integration_connected',
  'integration_disconnected',
  'finding_created',
  'finding_updated',
  'finding_resolved',
  'ai_analysis_requested',
  'ai_analysis_completed',
  'export_generated',
  'settings_changed'
);

-- =====================
-- CORE TABLES
-- =====================

-- Organizations (Tenants)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workspaces (sub-divisions within organizations)
CREATE TABLE public.workspaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, slug)
);

-- Projects (repositories, applications, services)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  repository_url TEXT,
  default_branch TEXT DEFAULT 'main',
  settings JSONB DEFAULT '{}',
  risk_score NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(workspace_id, slug)
);

-- Environments (dev, staging, prod)
CREATE TABLE public.environments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  is_production BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, slug)
);

-- User profiles (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  job_title TEXT,
  mfa_enabled BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles (separate table for RBAC - critical for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Organization memberships
CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- =====================
-- INTEGRATIONS
-- =====================

CREATE TABLE public.integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  type public.integration_type NOT NULL,
  name TEXT NOT NULL,
  status public.integration_status DEFAULT 'disconnected',
  config JSONB DEFAULT '{}', -- non-sensitive config
  credentials_encrypted TEXT, -- encrypted credentials reference
  scopes TEXT[],
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  health_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- ASSETS
-- =====================

CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  type public.asset_type NOT NULL,
  name TEXT NOT NULL,
  identifier TEXT NOT NULL, -- external ID (repo full name, image digest, etc.)
  metadata JSONB DEFAULT '{}',
  criticality INTEGER DEFAULT 5 CHECK (criticality >= 1 AND criticality <= 10),
  is_internet_exposed BOOLEAN DEFAULT false,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(project_id, type, identifier)
);

-- =====================
-- FINDINGS
-- =====================

CREATE TABLE public.findings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  environment_id UUID REFERENCES public.environments(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES public.assets(id) ON DELETE SET NULL,
  
  -- Core finding data
  title TEXT NOT NULL,
  description TEXT,
  source public.finding_source NOT NULL,
  severity public.finding_severity NOT NULL,
  status public.finding_status DEFAULT 'new',
  
  -- Risk scoring
  confidence_score NUMERIC(3,2) DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  exploitability_score NUMERIC(3,2) CHECK (exploitability_score >= 0 AND exploitability_score <= 1),
  risk_score NUMERIC(5,2) DEFAULT 0,
  
  -- Technical details
  file_path TEXT,
  line_number INTEGER,
  code_snippet TEXT,
  cwe_id TEXT,
  cve_id TEXT,
  package_name TEXT,
  package_version TEXT,
  
  -- External references
  external_id TEXT, -- ID from source scanner
  external_url TEXT,
  
  -- Metadata
  raw_data JSONB DEFAULT '{}',
  tags TEXT[],
  
  -- AI analysis
  ai_summary TEXT,
  ai_remediation TEXT,
  ai_risk_explanation TEXT,
  ai_analyzed_at TIMESTAMPTZ,
  
  -- Ownership
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Timestamps
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finding correlations (link related findings)
CREATE TABLE public.finding_correlations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  related_finding_id UUID NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  correlation_type TEXT NOT NULL, -- 'duplicate', 'related', 'parent', 'child'
  confidence NUMERIC(3,2) DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(finding_id, related_finding_id)
);

-- Finding evidence attachments
CREATE TABLE public.finding_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- storage path
  file_type TEXT,
  file_size INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Finding comments/activity
CREATE TABLE public.finding_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  finding_id UUID NOT NULL REFERENCES public.findings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- AUDIT LOGS
-- =====================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type public.audit_event_type NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI activity logs (for compliance)
CREATE TABLE public.ai_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  finding_id UUID REFERENCES public.findings(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'summarize', 'analyze_risk', 'suggest_remediation'
  prompt_hash TEXT, -- hash of prompt for audit without storing sensitive data
  tokens_used INTEGER,
  model_used TEXT,
  response_summary TEXT, -- non-sensitive summary
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- INGESTION
-- =====================

CREATE TABLE public.ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES public.integrations(id) ON DELETE SET NULL,
  source public.finding_source NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_path TEXT, -- for manual uploads
  findings_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================
-- INDEXES
-- =====================

CREATE INDEX idx_workspaces_org ON public.workspaces(organization_id);
CREATE INDEX idx_projects_workspace ON public.projects(workspace_id);
CREATE INDEX idx_environments_project ON public.environments(project_id);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_org ON public.user_roles(organization_id);
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);
CREATE INDEX idx_integrations_org ON public.integrations(organization_id);
CREATE INDEX idx_assets_project ON public.assets(project_id);
CREATE INDEX idx_findings_project ON public.findings(project_id);
CREATE INDEX idx_findings_status ON public.findings(status);
CREATE INDEX idx_findings_severity ON public.findings(severity);
CREATE INDEX idx_findings_source ON public.findings(source);
CREATE INDEX idx_findings_created ON public.findings(created_at DESC);
CREATE INDEX idx_finding_correlations_finding ON public.finding_correlations(finding_id);
CREATE INDEX idx_finding_evidence_finding ON public.finding_evidence(finding_id);
CREATE INDEX idx_finding_comments_finding ON public.finding_comments(finding_id);
CREATE INDEX idx_audit_logs_org ON public.audit_logs(organization_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs(created_at DESC);
CREATE INDEX idx_ai_activity_org ON public.ai_activity_logs(organization_id);
CREATE INDEX idx_ingestion_jobs_org ON public.ingestion_jobs(organization_id);

-- =====================
-- SECURITY FUNCTIONS
-- =====================

-- Check if user has a specific role in an organization
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _org_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = _role
  )
$$;

-- Check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _org_id UUID, _roles public.app_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND role = ANY(_roles)
  )
$$;

-- Check if user is member of organization
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = _user_id
      AND organization_id = _org_id
      AND accepted_at IS NOT NULL
  )
$$;

-- Get user's organization IDs
CREATE OR REPLACE FUNCTION public.get_user_org_ids(_user_id UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.organization_members
  WHERE user_id = _user_id
    AND accepted_at IS NOT NULL
$$;

-- Get organization ID from workspace
CREATE OR REPLACE FUNCTION public.get_org_from_workspace(_workspace_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.workspaces WHERE id = _workspace_id
$$;

-- Get organization ID from project
CREATE OR REPLACE FUNCTION public.get_org_from_project(_project_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT w.organization_id 
  FROM public.projects p
  JOIN public.workspaces w ON p.workspace_id = w.id
  WHERE p.id = _project_id
$$;

-- =====================
-- ROW LEVEL SECURITY
-- =====================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.environments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finding_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finding_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finding_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingestion_jobs ENABLE ROW LEVEL SECURITY;

-- Organizations policies
CREATE POLICY "Users can view their organizations"
  ON public.organizations FOR SELECT
  TO authenticated
  USING (id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Org owners can update their organization"
  ON public.organizations FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), id, 'org_owner'));

-- Workspaces policies
CREATE POLICY "Users can view workspaces in their orgs"
  ON public.workspaces FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can create workspaces"
  ON public.workspaces FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin']::public.app_role[]));

CREATE POLICY "Admins can update workspaces"
  ON public.workspaces FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin']::public.app_role[]));

CREATE POLICY "Admins can delete workspaces"
  ON public.workspaces FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin']::public.app_role[]));

-- Projects policies
CREATE POLICY "Users can view projects in their orgs"
  ON public.projects FOR SELECT
  TO authenticated
  USING (public.get_org_from_workspace(workspace_id) IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Non-auditors can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), public.get_org_from_workspace(workspace_id), 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

CREATE POLICY "Non-auditors can update projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), public.get_org_from_workspace(workspace_id), 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

-- Environments policies
CREATE POLICY "Users can view environments in their projects"
  ON public.environments FOR SELECT
  TO authenticated
  USING (public.get_org_from_project(project_id) IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can manage environments"
  ON public.environments FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), public.get_org_from_project(project_id), 
    ARRAY['org_owner', 'security_admin', 'devops_engineer']::public.app_role[]));

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in same org"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT om.user_id FROM public.organization_members om
    WHERE om.organization_id IN (SELECT public.get_user_org_ids(auth.uid()))
  ));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User roles policies
CREATE POLICY "Users can view roles in their orgs"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Org owners can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), organization_id, 'org_owner'));

-- Organization members policies
CREATE POLICY "Users can view members in their orgs"
  ON public.organization_members FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can invite members"
  ON public.organization_members FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin']::public.app_role[]));

CREATE POLICY "Admins can remove members"
  ON public.organization_members FOR DELETE
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin']::public.app_role[]));

-- Integrations policies
CREATE POLICY "Users can view integrations in their orgs"
  ON public.integrations FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Admins can manage integrations"
  ON public.integrations FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin', 'devops_engineer']::public.app_role[]));

-- Assets policies
CREATE POLICY "Users can view assets in their projects"
  ON public.assets FOR SELECT
  TO authenticated
  USING (public.get_org_from_project(project_id) IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Non-auditors can manage assets"
  ON public.assets FOR ALL
  TO authenticated
  USING (public.has_any_role(auth.uid(), public.get_org_from_project(project_id), 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

-- Findings policies
CREATE POLICY "Users can view findings in their projects"
  ON public.findings FOR SELECT
  TO authenticated
  USING (public.get_org_from_project(project_id) IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Non-auditors can create findings"
  ON public.findings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), public.get_org_from_project(project_id), 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

CREATE POLICY "Non-auditors can update findings"
  ON public.findings FOR UPDATE
  TO authenticated
  USING (public.has_any_role(auth.uid(), public.get_org_from_project(project_id), 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

-- Finding correlations policies
CREATE POLICY "Users can view finding correlations"
  ON public.finding_correlations FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.findings f 
    WHERE f.id = finding_id 
    AND public.get_org_from_project(f.project_id) IN (SELECT public.get_user_org_ids(auth.uid()))
  ));

-- Finding evidence policies
CREATE POLICY "Users can view finding evidence"
  ON public.finding_evidence FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.findings f 
    WHERE f.id = finding_id 
    AND public.get_org_from_project(f.project_id) IN (SELECT public.get_user_org_ids(auth.uid()))
  ));

CREATE POLICY "Non-auditors can add evidence"
  ON public.finding_evidence FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.findings f 
    WHERE f.id = finding_id 
    AND public.has_any_role(auth.uid(), public.get_org_from_project(f.project_id), 
      ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[])
  ));

-- Finding comments policies
CREATE POLICY "Users can view finding comments"
  ON public.finding_comments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.findings f 
    WHERE f.id = finding_id 
    AND public.get_org_from_project(f.project_id) IN (SELECT public.get_user_org_ids(auth.uid()))
  ));

CREATE POLICY "Non-auditors can add comments"
  ON public.finding_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.findings f 
      WHERE f.id = finding_id 
      AND public.has_any_role(auth.uid(), public.get_org_from_project(f.project_id), 
        ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[])
    )
  );

-- Audit logs policies
CREATE POLICY "Admins and auditors can view audit logs"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin', 'auditor']::public.app_role[]));

-- AI activity logs policies
CREATE POLICY "Admins can view AI activity logs"
  ON public.ai_activity_logs FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), organization_id, ARRAY['org_owner', 'security_admin', 'auditor']::public.app_role[]));

-- Ingestion jobs policies
CREATE POLICY "Users can view ingestion jobs in their orgs"
  ON public.ingestion_jobs FOR SELECT
  TO authenticated
  USING (organization_id IN (SELECT public.get_user_org_ids(auth.uid())));

CREATE POLICY "Non-auditors can create ingestion jobs"
  ON public.ingestion_jobs FOR INSERT
  TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), organization_id, 
    ARRAY['org_owner', 'security_admin', 'security_analyst', 'devops_engineer', 'developer']::public.app_role[]));

-- =====================
-- TRIGGERS
-- =====================

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON public.workspaces FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_environments_updated_at BEFORE UPDATE ON public.environments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_user_roles_updated_at BEFORE UPDATE ON public.user_roles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON public.integrations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_findings_updated_at BEFORE UPDATE ON public.findings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER update_finding_comments_updated_at BEFORE UPDATE ON public.finding_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();