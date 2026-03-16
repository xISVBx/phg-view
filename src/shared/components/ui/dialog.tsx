import { ReactNode, useEffect, useRef } from 'react';
import { Button } from './button';
import { cn } from '../../lib/cn';

type DialogSize = 'sm' | 'md' | 'lg' | 'xl';

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  size?: DialogSize;
  onClose: () => void;
  children: ReactNode;
};

const sizeClass: Record<DialogSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Dialog({ open, title, description, size = 'md', onClose, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className={cn('w-full rounded-2xl border border-slate-200 p-0 shadow-xl backdrop:bg-slate-900/30', sizeClass[size])}
    >
      <div className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>

        <div>{children}</div>

        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </dialog>
  );
}
