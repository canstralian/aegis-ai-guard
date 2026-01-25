export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_activity_logs: {
        Row: {
          action: string
          created_at: string
          finding_id: string | null
          id: string
          model_used: string | null
          organization_id: string
          prompt_hash: string | null
          response_summary: string | null
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          finding_id?: string | null
          id?: string
          model_used?: string | null
          organization_id: string
          prompt_hash?: string | null
          response_summary?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          finding_id?: string | null
          id?: string
          model_used?: string | null
          organization_id?: string
          prompt_hash?: string | null
          response_summary?: string | null
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_activity_logs_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          created_at: string
          criticality: number | null
          id: string
          identifier: string
          integration_id: string | null
          is_internet_exposed: boolean | null
          last_scanned_at: string | null
          metadata: Json | null
          name: string
          project_id: string
          type: Database["public"]["Enums"]["asset_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          criticality?: number | null
          id?: string
          identifier: string
          integration_id?: string | null
          is_internet_exposed?: boolean | null
          last_scanned_at?: string | null
          metadata?: Json | null
          name: string
          project_id: string
          type: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          criticality?: number | null
          id?: string
          identifier?: string
          integration_id?: string | null
          is_internet_exposed?: boolean | null
          last_scanned_at?: string | null
          metadata?: Json | null
          name?: string
          project_id?: string
          type?: Database["public"]["Enums"]["asset_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id: string
          ip_address: unknown
          organization_id: string
          resource_id: string | null
          resource_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          event_type: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          organization_id: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          event_type?: Database["public"]["Enums"]["audit_event_type"]
          id?: string
          ip_address?: unknown
          organization_id?: string
          resource_id?: string | null
          resource_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      environments: {
        Row: {
          created_at: string
          id: string
          is_production: boolean | null
          name: string
          project_id: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_production?: boolean | null
          name: string
          project_id: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_production?: boolean | null
          name?: string
          project_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "environments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      finding_comments: {
        Row: {
          content: string
          created_at: string
          finding_id: string
          id: string
          is_system: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          finding_id: string
          id?: string
          is_system?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          finding_id?: string
          id?: string
          is_system?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finding_comments_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
        ]
      }
      finding_correlations: {
        Row: {
          confidence: number | null
          correlation_type: string
          created_at: string
          finding_id: string
          id: string
          related_finding_id: string
        }
        Insert: {
          confidence?: number | null
          correlation_type: string
          created_at?: string
          finding_id: string
          id?: string
          related_finding_id: string
        }
        Update: {
          confidence?: number | null
          correlation_type?: string
          created_at?: string
          finding_id?: string
          id?: string
          related_finding_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "finding_correlations_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finding_correlations_related_finding_id_fkey"
            columns: ["related_finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
        ]
      }
      finding_evidence: {
        Row: {
          created_at: string
          description: string | null
          file_path: string
          file_size: number | null
          file_type: string | null
          finding_id: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_path: string
          file_size?: number | null
          file_type?: string | null
          finding_id: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          finding_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "finding_evidence_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "findings"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          ai_analyzed_at: string | null
          ai_remediation: string | null
          ai_risk_explanation: string | null
          ai_summary: string | null
          asset_id: string | null
          assigned_to: string | null
          code_snippet: string | null
          confidence_score: number | null
          created_at: string
          cve_id: string | null
          cwe_id: string | null
          description: string | null
          environment_id: string | null
          exploitability_score: number | null
          external_id: string | null
          external_url: string | null
          file_path: string | null
          first_seen_at: string | null
          id: string
          last_seen_at: string | null
          line_number: number | null
          package_name: string | null
          package_version: string | null
          project_id: string
          raw_data: Json | null
          resolved_at: string | null
          resolved_by: string | null
          risk_score: number | null
          severity: Database["public"]["Enums"]["finding_severity"]
          source: Database["public"]["Enums"]["finding_source"]
          status: Database["public"]["Enums"]["finding_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_analyzed_at?: string | null
          ai_remediation?: string | null
          ai_risk_explanation?: string | null
          ai_summary?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          code_snippet?: string | null
          confidence_score?: number | null
          created_at?: string
          cve_id?: string | null
          cwe_id?: string | null
          description?: string | null
          environment_id?: string | null
          exploitability_score?: number | null
          external_id?: string | null
          external_url?: string | null
          file_path?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          line_number?: number | null
          package_name?: string | null
          package_version?: string | null
          project_id: string
          raw_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          severity: Database["public"]["Enums"]["finding_severity"]
          source: Database["public"]["Enums"]["finding_source"]
          status?: Database["public"]["Enums"]["finding_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_analyzed_at?: string | null
          ai_remediation?: string | null
          ai_risk_explanation?: string | null
          ai_summary?: string | null
          asset_id?: string | null
          assigned_to?: string | null
          code_snippet?: string | null
          confidence_score?: number | null
          created_at?: string
          cve_id?: string | null
          cwe_id?: string | null
          description?: string | null
          environment_id?: string | null
          exploitability_score?: number | null
          external_id?: string | null
          external_url?: string | null
          file_path?: string | null
          first_seen_at?: string | null
          id?: string
          last_seen_at?: string | null
          line_number?: number | null
          package_name?: string | null
          package_version?: string | null
          project_id?: string
          raw_data?: Json | null
          resolved_at?: string | null
          resolved_by?: string | null
          risk_score?: number | null
          severity?: Database["public"]["Enums"]["finding_severity"]
          source?: Database["public"]["Enums"]["finding_source"]
          status?: Database["public"]["Enums"]["finding_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "findings_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      github_repositories: {
        Row: {
          created_at: string
          default_branch: string
          findings_synced: number | null
          full_name: string
          github_id: number
          html_url: string
          id: string
          integration_id: string
          last_sync_at: string | null
          last_sync_error: string | null
          last_sync_status: string | null
          name: string
          organization_id: string
          owner: string
          private: boolean
          project_id: string | null
          sync_code_scanning: boolean
          sync_dependabot: boolean
          sync_secret_scanning: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_branch?: string
          findings_synced?: number | null
          full_name: string
          github_id: number
          html_url: string
          id?: string
          integration_id: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          name: string
          organization_id: string
          owner: string
          private?: boolean
          project_id?: string | null
          sync_code_scanning?: boolean
          sync_dependabot?: boolean
          sync_secret_scanning?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_branch?: string
          findings_synced?: number | null
          full_name?: string
          github_id?: number
          html_url?: string
          id?: string
          integration_id?: string
          last_sync_at?: string | null
          last_sync_error?: string | null
          last_sync_status?: string | null
          name?: string
          organization_id?: string
          owner?: string
          private?: boolean
          project_id?: string | null
          sync_code_scanning?: boolean
          sync_dependabot?: boolean
          sync_secret_scanning?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_repositories_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "github_repositories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "github_repositories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      github_sync_jobs: {
        Row: {
          alerts_found: number | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          findings_created: number | null
          findings_updated: number | null
          id: string
          organization_id: string
          repository_id: string
          started_at: string | null
          status: string
          sync_type: string
        }
        Insert: {
          alerts_found?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          findings_created?: number | null
          findings_updated?: number | null
          id?: string
          organization_id: string
          repository_id: string
          started_at?: string | null
          status?: string
          sync_type: string
        }
        Update: {
          alerts_found?: number | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          findings_created?: number | null
          findings_updated?: number | null
          id?: string
          organization_id?: string
          repository_id?: string
          started_at?: string | null
          status?: string
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "github_sync_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "github_sync_jobs_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "github_repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      ingestion_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          findings_count: number | null
          id: string
          integration_id: string | null
          organization_id: string
          project_id: string | null
          source: Database["public"]["Enums"]["finding_source"]
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          findings_count?: number | null
          id?: string
          integration_id?: string | null
          organization_id: string
          project_id?: string | null
          source: Database["public"]["Enums"]["finding_source"]
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          findings_count?: number | null
          id?: string
          integration_id?: string | null
          organization_id?: string
          project_id?: string | null
          source?: Database["public"]["Enums"]["finding_source"]
          started_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingestion_jobs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingestion_jobs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          config: Json | null
          created_at: string
          credentials_encrypted: string | null
          health_check_at: string | null
          id: string
          last_error: string | null
          last_sync_at: string | null
          name: string
          organization_id: string
          scopes: string[] | null
          status: Database["public"]["Enums"]["integration_status"] | null
          type: Database["public"]["Enums"]["integration_type"]
          updated_at: string
        }
        Insert: {
          config?: Json | null
          created_at?: string
          credentials_encrypted?: string | null
          health_check_at?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          name: string
          organization_id: string
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          type: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
        }
        Update: {
          config?: Json | null
          created_at?: string
          credentials_encrypted?: string | null
          health_check_at?: string | null
          id?: string
          last_error?: string | null
          last_sync_at?: string | null
          name?: string
          organization_id?: string
          scopes?: string[] | null
          status?: Database["public"]["Enums"]["integration_status"] | null
          type?: Database["public"]["Enums"]["integration_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          accepted_at: string | null
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id: string
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          job_title: string | null
          last_login_at: string | null
          mfa_enabled: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          job_title?: string | null
          last_login_at?: string | null
          mfa_enabled?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          job_title?: string | null
          last_login_at?: string | null
          mfa_enabled?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          default_branch: string | null
          description: string | null
          id: string
          name: string
          repository_url: string | null
          risk_score: number | null
          settings: Json | null
          slug: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          id?: string
          name: string
          repository_url?: string | null
          risk_score?: number | null
          settings?: Json | null
          slug: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          default_branch?: string | null
          description?: string | null
          id?: string
          name?: string
          repository_url?: string | null
          risk_score?: number | null
          settings?: Json | null
          slug?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspaces_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      organization_members_public: {
        Row: {
          created_at: string | null
          id: string | null
          is_active_member: boolean | null
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          is_active_member?: never
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          is_active_member?: never
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_org_from_project: { Args: { _project_id: string }; Returns: string }
      get_org_from_workspace: {
        Args: { _workspace_id: string }
        Returns: string
      }
      get_org_member_ids: { Args: { _org_id: string }; Returns: string[] }
      get_user_org_ids: { Args: { _user_id: string }; Returns: string[] }
      has_any_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _org_id: string
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "org_owner"
        | "security_admin"
        | "security_analyst"
        | "devops_engineer"
        | "developer"
        | "auditor"
      asset_type:
        | "repository"
        | "container_image"
        | "cloud_resource"
        | "kubernetes_workload"
        | "api_endpoint"
      audit_event_type:
        | "auth_login"
        | "auth_logout"
        | "auth_failed"
        | "user_invited"
        | "user_removed"
        | "role_changed"
        | "integration_connected"
        | "integration_disconnected"
        | "finding_created"
        | "finding_updated"
        | "finding_resolved"
        | "ai_analysis_requested"
        | "ai_analysis_completed"
        | "export_generated"
        | "settings_changed"
      finding_severity: "critical" | "high" | "medium" | "low" | "info"
      finding_source:
        | "sast"
        | "sca"
        | "secrets"
        | "iac"
        | "container"
        | "cspm"
        | "runtime"
        | "manual"
        | "github_dependabot"
        | "github_code_scanning"
        | "github_secret_scanning"
      finding_status:
        | "new"
        | "triaged"
        | "in_progress"
        | "resolved"
        | "ignored"
        | "false_positive"
      integration_status: "connected" | "disconnected" | "error" | "syncing"
      integration_type:
        | "github"
        | "gitlab"
        | "aws"
        | "gcp"
        | "azure"
        | "kubernetes"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "org_owner",
        "security_admin",
        "security_analyst",
        "devops_engineer",
        "developer",
        "auditor",
      ],
      asset_type: [
        "repository",
        "container_image",
        "cloud_resource",
        "kubernetes_workload",
        "api_endpoint",
      ],
      audit_event_type: [
        "auth_login",
        "auth_logout",
        "auth_failed",
        "user_invited",
        "user_removed",
        "role_changed",
        "integration_connected",
        "integration_disconnected",
        "finding_created",
        "finding_updated",
        "finding_resolved",
        "ai_analysis_requested",
        "ai_analysis_completed",
        "export_generated",
        "settings_changed",
      ],
      finding_severity: ["critical", "high", "medium", "low", "info"],
      finding_source: [
        "sast",
        "sca",
        "secrets",
        "iac",
        "container",
        "cspm",
        "runtime",
        "manual",
        "github_dependabot",
        "github_code_scanning",
        "github_secret_scanning",
      ],
      finding_status: [
        "new",
        "triaged",
        "in_progress",
        "resolved",
        "ignored",
        "false_positive",
      ],
      integration_status: ["connected", "disconnected", "error", "syncing"],
      integration_type: [
        "github",
        "gitlab",
        "aws",
        "gcp",
        "azure",
        "kubernetes",
      ],
    },
  },
} as const
