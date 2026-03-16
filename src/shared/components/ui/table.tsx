import type { HTMLAttributes, TableHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

export function TableShell({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm', className)} {...props} />;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn('min-w-full border-collapse text-sm', className)} {...props} />;
}
