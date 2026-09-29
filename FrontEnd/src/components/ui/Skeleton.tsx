import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({ className, variant = 'text', width, height }) => {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <div
      className={cn('skeleton', variants[variant], className)}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
};

const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('card-base p-5', className)}>
    <div className="flex items-center gap-3 mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton width="60%" className="mb-2" />
        <Skeleton width="40%" className="h-3" />
      </div>
    </div>
    <Skeleton className="mb-2" />
    <Skeleton width="80%" className="mb-2" />
    <Skeleton width="50%" />
  </div>
);

const SkeletonChart: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('card-base p-5', className)}>
    <Skeleton width="40%" className="mb-4 h-5" />
    <div className="flex items-end gap-2 h-40">
      {[60, 80, 45, 70, 90, 55, 75].map((h, i) => (
        <Skeleton key={i} variant="rectangular" className="flex-1" height={`${h}%`} />
      ))}
    </div>
  </div>
);

export { Skeleton, SkeletonCard, SkeletonChart };
export default Skeleton;
