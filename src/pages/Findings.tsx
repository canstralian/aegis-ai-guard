import { useState } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Search, Filter, Sparkles, Shield } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Demo data
const demoFindings = [
  { id: '1', title: 'SQL Injection vulnerability in user authentication', severity: 'critical' as const, status: 'new' as const, source: 'sast', project: 'Backend API', file: 'src/auth/login.ts', line: 45 },
  { id: '2', title: 'Cross-Site Scripting (XSS) in comment section', severity: 'high' as const, status: 'triaged' as const, source: 'sast', project: 'Web App', file: 'src/components/Comments.tsx', line: 23 },
  { id: '3', title: 'Vulnerable dependency: axios@0.21.0 (CVE-2021-3749)', severity: 'high' as const, status: 'in_progress' as const, source: 'sca', project: 'Web App', file: 'package.json', line: 15 },
  { id: '4', title: 'Hardcoded database password in configuration', severity: 'critical' as const, status: 'new' as const, source: 'secrets', project: 'Infrastructure', file: 'config/database.yml', line: 8 },
  { id: '5', title: 'Insecure S3 bucket policy allows public access', severity: 'high' as const, status: 'triaged' as const, source: 'iac', project: 'Infrastructure', file: 'terraform/s3.tf', line: 32 },
  { id: '6', title: 'Missing authentication on admin API endpoint', severity: 'critical' as const, status: 'new' as const, source: 'sast', project: 'Backend API', file: 'src/routes/admin.ts', line: 12 },
  { id: '7', title: 'Outdated base image with known vulnerabilities', severity: 'medium' as const, status: 'new' as const, source: 'container', project: 'Backend API', file: 'Dockerfile', line: 1 },
  { id: '8', title: 'Weak SSL/TLS configuration', severity: 'medium' as const, status: 'resolved' as const, source: 'cspm', project: 'Infrastructure', file: 'nginx.conf', line: 45 },
];

export default function Findings() {
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredFindings = demoFindings.filter(finding => {
    const matchesSearch = finding.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      finding.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || finding.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || finding.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Security Findings"
        description="View and manage security vulnerabilities across all projects"
      >
        <Button>
          <Sparkles className="h-4 w-4 mr-2" />
          AI Triage All
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search findings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="triaged">Triaged</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No findings found"
          description="No security findings match your current filters."
        />
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <Card key={finding.id} className="transition-all hover:shadow-md cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={finding.severity} />
                      <StatusBadge status={finding.status} />
                    </div>
                    <h3 className="font-semibold">{finding.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{finding.project}</span>
                      <span>•</span>
                      <span className="font-mono">{finding.file}:{finding.line}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Sparkles className="h-4 w-4 mr-1" />
                    Analyze
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
