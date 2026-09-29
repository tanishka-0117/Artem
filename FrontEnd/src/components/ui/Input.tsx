import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-body-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 bg-surface border border-border rounded-lg text-body text-text-primary placeholder:text-text-muted transition-colors duration-200',
              'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error && 'border-error focus:border-error focus:ring-error',
              leftIcon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-caption text-error">{error}</p>}
        {hint && !error && <p className="mt-1 text-caption text-text-muted">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-body-sm font-medium text-text-primary mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full min-h-[100px] px-3 py-2.5 bg-surface border border-border rounded-lg text-body text-text-primary placeholder:text-text-muted transition-colors duration-200 resize-y',
            'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-error focus:border-error focus:ring-error',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-caption text-error">{error}</p>}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;
