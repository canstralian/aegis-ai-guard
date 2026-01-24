import { cn } from '@/lib/utils';
import { FindingSeverity } from '@/types/database';
import { SEVERITY_CONFIG } from '@/lib/constants';
import { AlertOctagon, AlertTriangle, AlertCircle, Info, HelpCircle } from 'lucide-react';

const iconMap = {
  AlertOctagon,
  AlertTriangle,
  AlertCircle,
  Info,
  HelpCircle,
};

interface SeverityBadgeProps {
  severity: FindingSeverity;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SeverityBadge({ 
  severity, 
  showIcon = true, 
  size = 'md',
  className 
}: SeverityBadgeProps) {
  const config = SEVERITY_CONFIG[severity];
  const Icon = iconMap[config.icon as keyof typeof iconMap];

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px] gap-1',
    md: 'px-2 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
    lg: 'h-4 w-4',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium uppercase tracking-wide',
        config.bgColor,
        config.color,
        sizeClasses[size],
        className
      )}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} />}
      {config.label}
    </span>
  );
}
