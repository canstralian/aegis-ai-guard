import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, AlertOctagon, Clock, CheckCircle, TrendingDown } from 'lucide-react';
import { SeverityBadge } from '@/components/ui/severity-badge';
import { StatusBadge } from '@/components/ui/status-badge';

export default function Dashboard() {
  const { currentOrganization, profile } = useAuth();

  // Demo data - will be replaced with real data
  const stats = {
    total: 247,
    critical: 12,
    high: 34,
    medium: 89,
    resolved: 112,
    mttr: 4.2,
  };

  const recentFindings = [
    { id: '1', title: 'SQL Injection in /api/users endpoint', severity: 'critical' as const, status: 'new' as const, project: 'Backend API' },
    { id: '2', title: 'Vulnerable dependency: lodash@4.17.19', severity: 'high' as const, status: 'triaged' as const, project: 'Web App' },
    { id: '3', title: 'Hardcoded AWS credentials in config', severity: 'critical' as const, status: 'in_progress' as const, project: 'Infrastructure' },
    { id: '4', title: 'Missing rate limiting on auth endpoints', severity: 'medium' as const, status: 'new' as const, project: 'Backend API' },
  ];

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Welcome back, ${profile?.full_name?.split(' ')[0] || 'there'}!`}
        description={`Security overview for ${currentOrganization?.name || 'your organization'}`}
      />

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Findings"
          value={stats.total}
          icon={Shield}
          trend={{ value: -8, label: 'vs last week' }}
        />
        <StatCard
          title="Critical Issues"
          value={stats.critical}
          icon={AlertOctagon}
          variant="critical"
          trend={{ value: 2, label: 'vs last week' }}
        />
        <StatCard
          title="High Severity"
          value={stats.high}
          icon={AlertTriangle}
          variant="high"
        />
        <StatCard
          title="Resolved (30d)"
          value={stats.resolved}
          icon={CheckCircle}
          variant="success"
          trend={{ value: -15, label: 'improvement' }}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Mean Time to Remediate"
          value={`${stats.mttr} days`}
          icon={Clock}
          subtitle="Average resolution time"
        />
        <StatCard
          title="Medium Severity"
          value={stats.medium}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Risk Trend"
          value="Improving"
          icon={TrendingDown}
          variant="success"
          subtitle="Based on 30-day analysis"
        />
      </div>

      {/* Recent Findings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Critical & High Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentFindings.map((finding) => (
              <div
                key={finding.id}
                className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-4">
                  <SeverityBadge severity={finding.severity} />
                  <div>
                    <p className="font-medium">{finding.title}</p>
                    <p className="text-sm text-muted-foreground">{finding.project}</p>
                  </div>
                </div>
                <StatusBadge status={finding.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
