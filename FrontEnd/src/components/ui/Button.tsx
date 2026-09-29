import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover active:bg-primary-hover shadow-soft',
      secondary: 'bg-surface border border-border text-text-primary hover:bg-surface-soft hover:border-border-strong',
      ghost: 'text-text-secondary hover:text-text-primary hover:bg-surface-soft',
      danger: 'bg-error text-white hover:opacity-90',
      gradient: 'artem-gradient text-white shadow-soft hover:opacity-90',
    };

    const sizes = {
      sm: 'h-8 px-3 text-body-sm gap-1.5 rounded',
      md: 'h-10 px-4 text-body gap-2 rounded-lg',
      lg: 'h-12 px-6 text-body-lg gap-2.5 rounded-lg font-medium',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className,
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
export default Button;
