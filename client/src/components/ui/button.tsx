import { Loader2 } from 'lucide-react';
import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function LmsButton({ 
  children, 
  isLoading, 
  variant = 'primary', 
  size = 'md',
  className,
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-700',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    outline: 'border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:bg-slate-50',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoading ? 'Processing...' : children}
    </button>
  );
}
