import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TriageResult {
  finding_id: string;
  success: boolean;
  analysis?: {
    risk_score: number;
    summary: string;
    remediation: string;
    risk_explanation: string;
    suggested_status: string;
    priority_rank: number;
  };
  error?: string;
}

interface TriageResponse {
  message: string;
  analyzed: number;
  results: TriageResult[];
}

export function useAITriage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  const analyzeFinding = async (findingId: string): Promise<TriageResult | null> => {
    setIsAnalyzing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to use AI analysis');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-triage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'analyze',
            finding_id: findingId,
          }),
        }
      );

      if (response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
        return null;
      }

      if (response.status === 402) {
        toast.error('AI credits exhausted. Please add credits to continue.');
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Analysis failed');
      }

      const data: TriageResponse = await response.json();
      
      if (data.results?.[0]?.success) {
        toast.success('Finding analyzed successfully');
        return data.results[0];
      } else {
        toast.error(data.results?.[0]?.error || 'Analysis failed');
        return null;
      }
    } catch (error) {
      console.error('AI Triage error:', error);
      toast.error(error instanceof Error ? error.message : 'Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triageAll = async (findingIds?: string[]): Promise<TriageResponse | null> => {
    setIsAnalyzing(true);
    setProgress({ current: 0, total: findingIds?.length || 0 });
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please sign in to use AI analysis');
        return null;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-triage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'triage_all',
            finding_ids: findingIds,
          }),
        }
      );

      if (response.status === 429) {
        toast.error('Rate limit exceeded. Please try again later.');
        return null;
      }

      if (response.status === 402) {
        toast.error('AI credits exhausted. Please add credits to continue.');
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Batch analysis failed');
      }

      const data: TriageResponse = await response.json();
      
      toast.success(data.message);
      return data;
    } catch (error) {
      console.error('AI Triage batch error:', error);
      toast.error(error instanceof Error ? error.message : 'Batch analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
      setProgress({ current: 0, total: 0 });
    }
  };

  return {
    analyzeFinding,
    triageAll,
    isAnalyzing,
    progress,
  };
}
