import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox, AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    <div className="w-14 h-14 rounded-2xl bg-surface-soft flex items-center justify-center mb-4">
      {icon || <Inbox className="h-7 w-7 text-text-muted" />}
    </div>
    <h3 className="text-heading-3 text-text-primary mb-1.5">{title}</h3>
    {description && <p className="text-body text-text-secondary max-w-sm">{description}</p>}
    {action && (
      <Button variant="primary" size="md" onClick={action.onClick} className="mt-5">
        {action.label}
      </Button>
    )}
  </div>
);

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    <div className="w-14 h-14 rounded-2xl bg-error/10 flex items-center justify-center mb-4">
      <AlertTriangle className="h-7 w-7 text-error" />
    </div>
    <h3 className="text-heading-3 text-text-primary mb-1.5">{title}</h3>
    <p className="text-body text-text-secondary max-w-sm">{message}</p>
    {onRetry && (
      <Button variant="secondary" size="md" onClick={onRetry} leftIcon={<RefreshCw className="h-4 w-4" />} className="mt-5">
        Try Again
      </Button>
    )}
  </div>
);

interface LoadingStateProps {
  text?: string;
  className?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ text = 'Loading...', className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4" />
    <p className="text-body text-text-secondary">{text}</p>
  </div>
);

interface ScoreCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: number; isPositive: boolean };
  className?: string;
}

const ScoreCard: React.FC<ScoreCardProps> = ({ label, value, icon, trend, className }) => (
  <div className={cn('card-base p-5', className)}>
    <div className="flex items-start justify-between mb-3">
      <span className="text-body-sm text-text-secondary">{label}</span>
      {icon && <span className="text-text-muted">{icon}</span>}
    </div>
    <div className="flex items-end gap-2">
      <span className="text-heading-1 font-bold text-text-primary">{value}</span>
      {trend && (
        <span className={cn(
          'text-caption font-medium mb-1',
          trend.isPositive ? 'text-success' : 'text-error',
        )}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
        </span>
      )}
    </div>
  </div>
);

export { EmptyState, ErrorState, LoadingState, ScoreCard };
