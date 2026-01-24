// =============================================================
// AEGIS DEVSECOPS AI - TypeScript Database Types
// =============================================================

// Enums matching database
export type AppRole = 
  | 'org_owner'
  | 'security_admin'
  | 'security_analyst'
  | 'devops_engineer'
  | 'developer'
  | 'auditor';

export type FindingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type FindingStatus = 
  | 'new'
  | 'triaged'
  | 'in_progress'
  | 'resolved'
  | 'ignored'
  | 'false_positive';

export type FindingSource = 
  | 'sast'
  | 'sca'
  | 'secrets'
  | 'iac'
  | 'container'
  | 'cspm'
  | 'runtime'
  | 'manual'
  | 'github_dependabot'
  | 'github_code_scanning'
  | 'github_secret_scanning';

export type AssetType = 
  | 'repository'
  | 'container_image'
  | 'cloud_resource'
  | 'kubernetes_workload'
  | 'api_endpoint';

export type IntegrationType = 
  | 'github'
  | 'gitlab'
  | 'aws'
  | 'gcp'
  | 'azure'
  | 'kubernetes';

export type IntegrationStatus = 
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'syncing';

export type AuditEventType = 
  | 'auth_login'
  | 'auth_logout'
  | 'auth_failed'
  | 'user_invited'
  | 'user_removed'
  | 'role_changed'
  | 'integration_connected'
  | 'integration_disconnected'
  | 'finding_created'
  | 'finding_updated'
  | 'finding_resolved'
  | 'ai_analysis_requested'
  | 'ai_analysis_completed'
  | 'export_generated'
  | 'settings_changed';

// Database table types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Workspace {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  description?: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description?: string | null;
  repository_url?: string | null;
  default_branch: string;
  settings: Record<string, unknown>;
  risk_score: number;
  created_at: string;
  updated_at: string;
}

export interface Environment {
  id: string;
  project_id: string;
  name: string;
  slug: string;
  is_production: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  job_title?: string | null;
  mfa_enabled: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  organization_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  invited_by?: string | null;
  invited_at?: string | null;
  accepted_at?: string | null;
  created_at: string;
}

export interface Integration {
  id: string;
  organization_id: string;
  type: IntegrationType;
  name: string;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  credentials_encrypted?: string | null;
  scopes?: string[] | null;
  last_sync_at?: string | null;
  last_error?: string | null;
  health_check_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  project_id: string;
  integration_id?: string | null;
  type: AssetType;
  name: string;
  identifier: string;
  metadata: Record<string, unknown>;
  criticality: number;
  is_internet_exposed: boolean;
  last_scanned_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Finding {
  id: string;
  project_id: string;
  environment_id?: string | null;
  asset_id?: string | null;
  title: string;
  description?: string | null;
  source: FindingSource;
  severity: FindingSeverity;
  status: FindingStatus;
  confidence_score: number;
  exploitability_score?: number | null;
  risk_score: number;
  file_path?: string | null;
  line_number?: number | null;
  code_snippet?: string | null;
  cwe_id?: string | null;
  cve_id?: string | null;
  package_name?: string | null;
  package_version?: string | null;
  external_id?: string | null;
  external_url?: string | null;
  raw_data: Record<string, unknown>;
  tags?: string[] | null;
  ai_summary?: string | null;
  ai_remediation?: string | null;
  ai_risk_explanation?: string | null;
  ai_analyzed_at?: string | null;
  assigned_to?: string | null;
  resolved_by?: string | null;
  resolved_at?: string | null;
  first_seen_at: string;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface FindingCorrelation {
  id: string;
  finding_id: string;
  related_finding_id: string;
  correlation_type: string;
  confidence: number;
  created_at: string;
}

export interface FindingEvidence {
  id: string;
  finding_id: string;
  name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  description?: string | null;
  created_at: string;
}

export interface FindingComment {
  id: string;
  finding_id: string;
  user_id: string;
  content: string;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  event_type: AuditEventType;
  resource_type?: string | null;
  resource_id?: string | null;
  action: string;
  details: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}

export interface AIActivityLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  finding_id?: string | null;
  action: string;
  prompt_hash?: string | null;
  tokens_used?: number | null;
  model_used?: string | null;
  response_summary?: string | null;
  created_at: string;
}

export interface IngestionJob {
  id: string;
  organization_id: string;
  project_id?: string | null;
  integration_id?: string | null;
  source: FindingSource;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  file_path?: string | null;
  findings_count: number;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
}

// Extended types with relations
export interface FindingWithRelations extends Finding {
  asset?: Asset | null;
  environment?: Environment | null;
  project?: Project;
  assigned_user?: Profile | null;
}

export interface ProjectWithStats extends Project {
  findings_count?: number;
  critical_count?: number;
  high_count?: number;
  workspace?: Workspace;
}

export interface OrganizationWithRole extends Organization {
  role?: AppRole;
}

// Dashboard statistics
export interface DashboardStats {
  total_findings: number;
  critical_findings: number;
  high_findings: number;
  medium_findings: number;
  low_findings: number;
  info_findings: number;
  new_findings: number;
  resolved_findings: number;
  mttr_days: number;
  trend_percentage: number;
}

export interface SeverityDistribution {
  severity: FindingSeverity;
  count: number;
}

export interface SourceDistribution {
  source: FindingSource;
  count: number;
}

export interface FindingTrend {
  date: string;
  new_findings: number;
  resolved_findings: number;
}
