import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-violet-600 text-white shadow-sm hover:bg-violet-500 focus-visible:ring-violet-500 disabled:bg-violet-300',
  secondary:
    'bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 focus-visible:ring-violet-500',
  ghost: 'bg-transparent text-violet-700 hover:bg-violet-50 focus-visible:ring-violet-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:bg-red-300',
};

export function Button({ className, variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed',
        variantClass[variant],
        className,
      )}
      {...props}
    />
  );
}
