import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm transition',
        'placeholder:text-slate-400',
        'focus:border-violet-500 focus:outline-none focus:ring-4 focus:ring-violet-100',
        className,
      )}
      {...props}
    />
  );
}
