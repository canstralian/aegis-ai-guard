import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DeploymentGate {
  id: string;
  project_id: string;
  enabled: boolean;
  block_on_severities: string[];
  created_at: string;
  updated_at: string;
}

interface GateCheck {
  id: string;
  project_id: string;
  status: 'pass' | 'fail';
  blocking_finding_count: number;
  blocking_findings_summary: unknown[];
  triggered_by: string | null;
  api_token_hint: string | null;
  created_at: string;
}

export function useCIGate(projectId: string | undefined) {
  const [gate, setGate] = useState<DeploymentGate | null>(null);
  const [checks, setChecks] = useState<GateCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchGate = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      // Use type assertion since tables may not be in generated types yet
      const { data, error } = await (supabase as any)
        .from('deployment_gates')
        .select('*')
        .eq('project_id', projectId)
        .maybeSingle();

      if (error) throw error;
      setGate(data as DeploymentGate | null);

      const { data: checksData, error: checksError } = await (supabase as any)
        .from('gate_checks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (checksError) throw checksError;
      setChecks((checksData as GateCheck[]) || []);
    } catch (error) {
      console.error('Failed to fetch gate config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGate();
  }, [projectId]);

  const upsertGate = async (config: { enabled: boolean; block_on_severities: string[] }) => {
    if (!projectId) return;
    setIsSaving(true);
    try {
      const { data, error } = await (supabase as any)
        .from('deployment_gates')
        .upsert(
          {
            project_id: projectId,
            enabled: config.enabled,
            block_on_severities: config.block_on_severities,
          },
          { onConflict: 'project_id' }
        )
        .select()
        .single();

      if (error) throw error;
      setGate(data as DeploymentGate);
      toast.success('CI gate configuration saved');
    } catch (error) {
      console.error('Failed to save gate config:', error);
      toast.error('Failed to save gate configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const runCheck = async () => {
    if (!projectId) return;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ci-gate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ project_id: projectId }),
        }
      );

      const result = await response.json();
      if (result.status === 'pass') {
        toast.success(result.message);
      } else if (result.status === 'fail') {
        toast.warning(result.message);
      } else {
        toast.error(result.error || 'Gate check failed');
      }

      await fetchGate();
      return result;
    } catch (error) {
      console.error('Gate check failed:', error);
      toast.error('Failed to run gate check');
    }
  };

  return { gate, checks, isLoading, isSaving, upsertGate, runCheck, refetch: fetchGate };
}
