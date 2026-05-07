import { useState, useEffect } from 'react';
import { useCIGate } from '@/hooks/useCIGate';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/ui/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ShieldCheck,
  ShieldX,
  Play,
  Copy,
  Check,
  Terminal,
  Clock,
} from 'lucide-react';
import { toast } from 'sonner';

const SEVERITY_OPTIONS = [
  { value: 'critical', label: 'Critical', color: 'destructive' as const },
  { value: 'high', label: 'High', color: 'destructive' as const },
  { value: 'medium', label: 'Medium', color: 'default' as const },
  { value: 'low', label: 'Low', color: 'secondary' as const },
];

export default function CIGate() {
  const { currentOrganization } = useAuth();
  const [projects, setProjects] = useState<{ id: string; name: string; slug: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>();
  const [enabled, setEnabled] = useState(true);
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['critical', 'high']);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const { gate, checks, isLoading, isSaving, upsertGate, runCheck } = useCIGate(selectedProjectId);

  // Fetch projects for the current org
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentOrganization) return;
      const { data } = await supabase
        .from('projects')
        .select('id, name, slug');
      if (data) {
        setProjects(data);
        if (data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(data[0].id);
        }
      }
    };
    fetchProjects();
  }, [currentOrganization]);

  // Sync local state with fetched gate config
  useEffect(() => {
    if (gate) {
      setEnabled(gate.enabled);
      setSelectedSeverities(gate.block_on_severities);
    } else {
      setEnabled(true);
      setSelectedSeverities(['critical', 'high']);
    }
  }, [gate]);

  const handleSave = () => {
    upsertGate({ enabled, block_on_severities: selectedSeverities });
  };

  const handleRunCheck = async () => {
    setIsRunning(true);
    await runCheck();
    setIsRunning(false);
  };

  const toggleSeverity = (severity: string) => {
    setSelectedSeverities((prev) =>
      prev.includes(severity)
        ? prev.filter((s) => s !== severity)
        : [...prev, severity]
    );
  };

  const endpointUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ci-gate`;
  const curlExample = `curl -X POST "${endpointUrl}" \\
  -H "Content-Type: application/json" \\
  -H "X-Gate-Token: \${CI_GATE_TOKEN}" \\
  -d '{"project_id": "${selectedProjectId || '<PROJECT_ID>'}"}'

# Exit code: 0 = pass, non-zero = fail
# Status 200 = pass, 403 = blocked`;

  const ghActionsExample = `# .github/workflows/deploy.yml
name: Deploy with Security Gate
on:
  push:
    branches: [main]

jobs:
  security-gate:
    runs-on: ubuntu-latest
    steps:
      - name: Check CI security gate
        run: |
          RESPONSE=$(curl -sf -o /dev/null -w "%{http_code}" \\
            -X POST "${endpointUrl}" \\
            -H "Content-Type: application/json" \\
            -H "X-Gate-Token: \${{ secrets.CI_GATE_TOKEN }}" \\
            -d '{"project_id": "${selectedProjectId || '<PROJECT_ID>'}"}')
          if [ "$RESPONSE" != "200" ]; then
            echo "❌ Security gate FAILED — deployment blocked"
            exit 1
          fi
          echo "✅ Security gate passed"

  deploy:
    needs: security-gate
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        run: echo "Deploying..."`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      <PageHeader
        title="CI Security Gate"
        description="Block deployments when unresolved error-level security findings are detected."
      />

      {/* Project selector */}
      <div className="flex items-center gap-4">
        <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleRunCheck}
          disabled={isRunning || !selectedProjectId}
        >
          <Play className="mr-2 h-4 w-4" />
          {isRunning ? 'Checking...' : 'Run check now'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Gate Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Gate configuration
              </CardTitle>
              <CardDescription>
                Configure which severity levels block deployment in your CI pipeline.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Enable CI gate</p>
                  <p className="text-xs text-muted-foreground">
                    When disabled, the gate always returns "pass".
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>

              <div>
                <p className="text-sm font-medium mb-3">Block on severities</p>
                <div className="flex flex-wrap gap-3">
                  {SEVERITY_OPTIONS.map((sev) => (
                    <label
                      key={sev.value}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedSeverities.includes(sev.value)}
                        onCheckedChange={() => toggleSeverity(sev.value)}
                      />
                      <Badge variant={sev.color}>{sev.label}</Badge>
                    </label>
                  ))}
                </div>
              </div>

              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save configuration'}
              </Button>
            </CardContent>
          </Card>

          {/* Integration Guide */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                CI integration
              </CardTitle>
              <CardDescription>
                Add the gate check to your CI pipeline. The endpoint returns 200 (pass) or 403 (blocked).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">cURL</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(curlExample)}
                  >
                    {copied ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto whitespace-pre-wrap">
                  {curlExample}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">GitHub Actions</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(ghActionsExample)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="rounded-lg bg-muted p-3 text-xs overflow-x-auto whitespace-pre-wrap max-h-48">
                  {ghActionsExample}
                </pre>
              </div>
            </CardContent>
          </Card>

          {/* Recent Gate Checks */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent gate checks
              </CardTitle>
              <CardDescription>
                Audit trail of gate evaluations from CI runs and manual checks.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {checks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No gate checks recorded yet. Run your first check above or integrate into your CI pipeline.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Status</TableHead>
                      <TableHead>Blocking findings</TableHead>
                      <TableHead>Triggered by</TableHead>
                      <TableHead>Checked at</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell>
                          {check.status === 'pass' ? (
                            <Badge variant="default" className="bg-emerald-600/20 text-emerald-400 border-emerald-600/30">
                              <ShieldCheck className="mr-1 h-3 w-3" />
                              Pass
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <ShieldX className="mr-1 h-3 w-3" />
                              Fail
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {check.blocking_finding_count}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {check.triggered_by || 'Unknown'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(check.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
