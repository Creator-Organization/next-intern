import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'border-gray-100 bg-white placeholder:text-gray-500',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700"
          >
            {label}
          </label>
        )}
        <textarea
          id={inputId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm transition-colors',
            'border-gray-100 bg-white placeholder:text-gray-500',
            'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-100',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-none',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };