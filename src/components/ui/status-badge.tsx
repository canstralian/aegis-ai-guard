import { cn } from '@/lib/utils';
import { FindingStatus } from '@/types/database';
import { STATUS_CONFIG } from '@/lib/constants';
import { Sparkles, Eye, Clock, CheckCircle, EyeOff, XCircle } from 'lucide-react';

const iconMap = {
  Sparkles,
  Eye,
  Clock,
  CheckCircle,
  EyeOff,
  XCircle,
};

interface StatusBadgeProps {
  status: FindingStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ 
  status, 
  showIcon = true, 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
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
        'inline-flex items-center rounded-md font-medium',
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
