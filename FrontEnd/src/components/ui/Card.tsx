import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'ai' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'card-base',
      ai: 'card-ai ai-glow',
      interactive: 'card-interactive',
    };

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-5',
      lg: 'p-6',
    };

    return (
      <div
        ref={ref}
        className={cn(variants[variant], paddings[padding], 'animate-fade-in', className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
    {children}
  </div>
);

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}

const CardTitle: React.FC<CardTitleProps> = ({ className, children, ...props }) => (
  <h3 className={cn('text-heading-3 text-text-primary', className)} {...props}>
    {children}
  </h3>
);

export { Card, CardHeader, CardTitle };
export default Card;
