import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label?: string;
  };
  variant?: 'default' | 'critical' | 'high' | 'warning' | 'success';
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const variantStyles = {
    default: 'border-border',
    critical: 'border-severity-critical/50 bg-severity-critical/5',
    high: 'border-severity-high/50 bg-severity-high/5',
    warning: 'border-severity-medium/50 bg-severity-medium/5',
    success: 'border-status-success/50 bg-status-success/5',
  };

  const iconVariantStyles = {
    default: 'bg-primary/10 text-primary',
    critical: 'bg-severity-critical/20 text-severity-critical',
    high: 'bg-severity-high/20 text-severity-high',
    warning: 'bg-severity-medium/20 text-severity-medium',
    success: 'bg-status-success/20 text-status-success',
  };

  const TrendIcon = trend 
    ? trend.value > 0 
      ? TrendingUp 
      : trend.value < 0 
        ? TrendingDown 
        : Minus
    : null;

  const trendColor = trend
    ? trend.value > 0
      ? 'text-severity-high'
      : trend.value < 0
        ? 'text-status-success'
        : 'text-muted-foreground'
    : '';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:shadow-md',
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {trend && TrendIcon && (
            <div className={cn('flex items-center gap-1 text-sm', trendColor)}>
              <TrendIcon className="h-4 w-4" />
              <span className="font-medium">
                {Math.abs(trend.value)}%
              </span>
              {trend.label && (
                <span className="text-muted-foreground">{trend.label}</span>
              )}
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-3', iconVariantStyles[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        )}
      </div>
    </div>
  );
}
