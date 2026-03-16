import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type CheckboxProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  description?: string;
};

export function Checkbox({ checked, onCheckedChange, label, description, className, disabled, ...props }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'flex w-full items-start gap-3 rounded-xl border px-3.5 py-3 text-left transition',
        checked
          ? 'border-violet-300 bg-violet-50/70 shadow-sm shadow-violet-100'
          : 'border-slate-200 bg-white hover:border-violet-200 hover:bg-violet-50/30',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition',
          checked ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300 bg-white text-transparent',
        )}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.2 7.26a1 1 0 0 1-1.42.005L3.3 9.19a1 1 0 0 1 1.4-1.43l4.08 4.01 6.5-6.55a1 1 0 0 1 1.424.07Z"
            clipRule="evenodd"
          />
        </svg>
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-800">{label}</span>
        {description ? <span className="mt-0.5 block text-xs text-slate-500">{description}</span> : null}
      </span>
    </button>
  );
}
