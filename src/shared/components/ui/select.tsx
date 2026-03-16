import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '../../lib/cn';

export type SelectOption = {
  value: string;
  label: string;
  description?: string;
};

type SelectProps = {
  value?: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  selectedLabel?: string;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  localPageSize?: number;
  hasMore?: boolean;
  onLoadMore?: () => void | Promise<void>;
  onSearchChange?: (query: string) => void | Promise<void>;
  className?: string;
};

export function Select({
  value,
  onChange,
  options,
  selectedLabel,
  placeholder = 'Select an option',
  searchable = false,
  searchPlaceholder = 'Search...',
  disabled = false,
  loading = false,
  emptyMessage = 'No options found.',
  localPageSize = 8,
  hasMore = false,
  onLoadMore,
  onSearchChange,
  className,
}: SelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [localPage, setLocalPage] = useState(1);

  const selectedOption = options.find((option) => option.value === value);
  const selectedText = selectedOption?.label ?? (value ? selectedLabel ?? value : placeholder);
  const isServerDriven = Boolean(onSearchChange || onLoadMore);

  useEffect(() => {
    if (!open) return;

    const onClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);

    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchable) {
      searchInputRef.current?.focus();
    }
  }, [open, searchable]);

  useEffect(() => {
    setLocalPage(1);
  }, [query]);

  const filteredOptions = useMemo(() => {
    if (isServerDriven || !searchable) {
      return options;
    }

    const normalized = query.trim().toLowerCase();
    if (!normalized) return options;

    return options.filter((option) => {
      const haystack = `${option.label} ${option.description ?? ''}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [isServerDriven, options, query, searchable]);

  const visibleOptions = useMemo(() => {
    if (isServerDriven) return filteredOptions;

    const end = localPage * localPageSize;
    return filteredOptions.slice(0, end);
  }, [filteredOptions, isServerDriven, localPage, localPageSize]);

  const canLoadMoreLocal = !isServerDriven && visibleOptions.length < filteredOptions.length;
  const canLoadMoreServer = isServerDriven && hasMore;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-left text-sm text-slate-900 shadow-sm transition',
          'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 focus-visible:border-violet-500',
          'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400',
          open && 'border-violet-500 ring-4 ring-violet-100',
        )}
      >
        <span className={cn(!value && 'text-slate-400')}>{selectedText}</span>
        <span className={cn('ml-2 text-xs transition', open ? 'rotate-180 text-violet-700' : 'text-slate-500')}>▾</span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          {searchable ? (
            <div className="border-b border-slate-100 p-2">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(event) => {
                  const next = event.target.value;
                  setQuery(next);
                  void onSearchChange?.(next);
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>
          ) : null}

          <div className="max-h-64 overflow-y-auto p-1.5">
            {loading ? <p className="px-2 py-2 text-sm text-slate-500">Loading...</p> : null}

            {!loading && visibleOptions.length === 0 ? <p className="px-2 py-2 text-sm text-slate-500">{emptyMessage}</p> : null}

            {!loading
              ? visibleOptions.map((option) => {
                  const active = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        setOpen(false);
                      }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left transition',
                        active ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-violet-50 hover:text-violet-700',
                      )}
                    >
                      <p className="text-sm font-medium">{option.label}</p>
                      {option.description ? (
                        <p className={cn('mt-0.5 text-xs', active ? 'text-violet-100' : 'text-slate-500')}>{option.description}</p>
                      ) : null}
                    </button>
                  );
                })
              : null}
          </div>

          {canLoadMoreLocal || canLoadMoreServer ? (
            <div className="border-t border-slate-100 p-2">
              <button
                type="button"
                className="w-full rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
                onClick={() => {
                  if (canLoadMoreLocal) {
                    setLocalPage((prev) => prev + 1);
                    return;
                  }

                  void onLoadMore?.();
                }}
              >
                Load more
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
