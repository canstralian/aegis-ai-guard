// =============================================================
// AEGIS DEVSECOPS AI - Application Constants
// =============================================================

import { FindingSeverity, FindingStatus, FindingSource, AppRole } from '@/types/database';

// Severity configuration
export const SEVERITY_CONFIG: Record<FindingSeverity, { 
  label: string; 
  color: string; 
  bgColor: string; 
  icon: string;
  priority: number;
}> = {
  critical: { 
    label: 'Critical', 
    color: 'text-white', 
    bgColor: 'bg-severity-critical', 
    icon: 'AlertOctagon',
    priority: 1
  },
  high: { 
    label: 'High', 
    color: 'text-white', 
    bgColor: 'bg-severity-high', 
    icon: 'AlertTriangle',
    priority: 2
  },
  medium: { 
    label: 'Medium', 
    color: 'text-black', 
    bgColor: 'bg-severity-medium', 
    icon: 'AlertCircle',
    priority: 3
  },
  low: { 
    label: 'Low', 
    color: 'text-white', 
    bgColor: 'bg-severity-low', 
    icon: 'Info',
    priority: 4
  },
  info: { 
    label: 'Info', 
    color: 'text-white', 
    bgColor: 'bg-severity-info', 
    icon: 'HelpCircle',
    priority: 5
  },
};

// Status configuration
export const STATUS_CONFIG: Record<FindingStatus, { 
  label: string; 
  color: string; 
  bgColor: string;
  icon: string;
}> = {
  new: { label: 'New', color: 'text-primary', bgColor: 'bg-primary/10', icon: 'Sparkles' },
  triaged: { label: 'Triaged', color: 'text-status-info', bgColor: 'bg-status-info/10', icon: 'Eye' },
  in_progress: { label: 'In Progress', color: 'text-status-warning', bgColor: 'bg-status-warning/10', icon: 'Clock' },
  resolved: { label: 'Resolved', color: 'text-status-success', bgColor: 'bg-status-success/10', icon: 'CheckCircle' },
  ignored: { label: 'Ignored', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: 'EyeOff' },
  false_positive: { label: 'False Positive', color: 'text-muted-foreground', bgColor: 'bg-muted', icon: 'XCircle' },
};

// Source configuration
export const SOURCE_CONFIG: Record<FindingSource, { 
  label: string; 
  description: string;
  icon: string;
}> = {
  sast: { label: 'SAST', description: 'Static Application Security Testing', icon: 'Code' },
  sca: { label: 'SCA', description: 'Software Composition Analysis', icon: 'Package' },
  secrets: { label: 'Secrets', description: 'Secret Scanning', icon: 'Key' },
  iac: { label: 'IaC', description: 'Infrastructure as Code', icon: 'Server' },
  container: { label: 'Container', description: 'Container Image Scanning', icon: 'Box' },
  cspm: { label: 'CSPM', description: 'Cloud Security Posture Management', icon: 'Cloud' },
  runtime: { label: 'Runtime', description: 'Runtime Security Monitoring', icon: 'Activity' },
  manual: { label: 'Manual', description: 'Manual Upload', icon: 'Upload' },
  github_dependabot: { label: 'Dependabot', description: 'GitHub Dependabot Alerts', icon: 'Github' },
  github_code_scanning: { label: 'Code Scanning', description: 'GitHub Code Scanning', icon: 'Search' },
  github_secret_scanning: { label: 'Secret Scanning', description: 'GitHub Secret Scanning', icon: 'Lock' },
};

// Role configuration
export const ROLE_CONFIG: Record<AppRole, {
  label: string;
  description: string;
  permissions: string[];
}> = {
  org_owner: {
    label: 'Organization Owner',
    description: 'Full access to all organization settings and resources',
    permissions: ['manage_org', 'manage_members', 'manage_integrations', 'manage_projects', 'view_findings', 'manage_findings', 'view_audit_logs'],
  },
  security_admin: {
    label: 'Security Admin',
    description: 'Manage security settings, integrations, and team members',
    permissions: ['manage_members', 'manage_integrations', 'manage_projects', 'view_findings', 'manage_findings', 'view_audit_logs'],
  },
  security_analyst: {
    label: 'Security Analyst',
    description: 'Analyze and triage security findings',
    permissions: ['manage_projects', 'view_findings', 'manage_findings'],
  },
  devops_engineer: {
    label: 'DevOps Engineer',
    description: 'Manage infrastructure and CI/CD integrations',
    permissions: ['manage_integrations', 'manage_projects', 'view_findings', 'manage_findings'],
  },
  developer: {
    label: 'Developer',
    description: 'View and fix security findings in assigned projects',
    permissions: ['view_projects', 'view_findings', 'manage_findings'],
  },
  auditor: {
    label: 'Auditor',
    description: 'Read-only access for compliance and audit purposes',
    permissions: ['view_projects', 'view_findings', 'view_audit_logs'],
  },
};

// Navigation items
export const MAIN_NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { name: 'Findings', href: '/findings', icon: 'Shield' },
  { name: 'Projects', href: '/projects', icon: 'FolderKanban' },
  { name: 'Assets', href: '/assets', icon: 'Server' },
  { name: 'Integrations', href: '/integrations', icon: 'Plug' },
];

export const ADMIN_NAV_ITEMS = [
  { name: 'Team', href: '/admin/team', icon: 'Users' },
  { name: 'Audit Logs', href: '/admin/audit-logs', icon: 'ScrollText' },
  { name: 'Settings', href: '/admin/settings', icon: 'Settings' },
];

// File upload limits
export const UPLOAD_LIMITS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['.sarif', '.json', '.csv'],
  allowedMimeTypes: ['application/json', 'text/csv', 'application/sarif+json'],
};

// Pagination defaults
export const PAGINATION = {
  defaultPageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
};

// Risk score thresholds
export const RISK_THRESHOLDS = {
  critical: 90,
  high: 70,
  medium: 40,
  low: 20,
};
