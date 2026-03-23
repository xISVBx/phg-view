import { Suspense, lazy } from 'react';
import type { ComponentType, LazyExoticComponent, ReactElement } from 'react';

type AnyComponent = ComponentType<any>;

type LazyPageProps = {
  component: LazyExoticComponent<AnyComponent>;
};

const routeLoader = (
  <main className="grid min-h-[50vh] place-items-center rounded-3xl border border-slate-200 bg-white/80 px-6 py-10 text-sm font-medium text-slate-500 shadow-sm">
    Loading page...
  </main>
);

export function lazyPage<T extends AnyComponent>(
  load: () => Promise<Record<string, unknown>>,
  exportName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const module = await load();
    const component = module[exportName];

    if (typeof component !== 'function') {
      throw new Error(`Lazy page export "${exportName}" was not found.`);
    }

    return { default: component as T };
  });
}

export function LazyPage({ component: Component }: LazyPageProps): ReactElement {
  return <Suspense fallback={routeLoader}><Component /></Suspense>;
}
