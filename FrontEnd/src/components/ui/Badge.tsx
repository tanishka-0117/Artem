import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ai' | 'outline';
  size?: 'sm' | 'md';
}

const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', size = 'sm', children, ...props }) => {
  const variants = {
    default: 'bg-surface-soft text-text-secondary border border-border',
    success: 'bg-success/10 text-success border border-success/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
    error: 'bg-error/10 text-error border border-error/20',
    info: 'bg-info/10 text-info border border-info/20',
    ai: 'artem-gradient text-white border-0',
    outline: 'bg-transparent text-text-secondary border border-border-strong',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[0.6875rem]',
    md: 'px-2.5 py-1 text-caption',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-md whitespace-nowrap',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

const AIBadge: React.FC<{ className?: string }> = ({ className }) => (
  <Badge variant="ai" className={cn('gap-1', className)}>
    <span className="text-[0.625rem]">✦</span> AI
  </Badge>
);

const DifficultyBadge: React.FC<{ difficulty: string; className?: string }> = ({ difficulty, className }) => {
  const variant = difficulty === 'Easy' ? 'success' : difficulty === 'Medium' ? 'warning' : difficulty === 'Hard' ? 'error' : 'default';
  return <Badge variant={variant} className={className}>{difficulty}</Badge>;
};

export { Badge, AIBadge, DifficultyBadge };
export default Badge;
