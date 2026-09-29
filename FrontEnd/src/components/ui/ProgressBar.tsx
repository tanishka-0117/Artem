import React from 'react';
import { cn, getReadinessColor } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value, max = 100, size = 'md', showLabel = false, color, className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const barColor = color || getReadinessColor(percentage);

  const sizes = { sm: 'h-1.5', md: 'h-2', lg: 'h-3' };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1">
          <span className="text-caption text-text-secondary">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-surface-soft rounded-full overflow-hidden', sizes[size])}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
};

interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value, max = 100, size = 120, strokeWidth = 8, color, showValue = true, label, className,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const progressColor = color || getReadinessColor(percentage);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--surface-soft)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-heading-2 font-bold text-text-primary">{Math.round(percentage)}</span>
          {label && <span className="text-caption text-text-muted">{label}</span>}
        </div>
      )}
    </div>
  );
};

export { ProgressBar, CircularProgress };
export default ProgressBar;
