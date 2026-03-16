import { Card, CardContent, CardHeader } from '../shared/components/ui/card';

type ModulePageProps = {
  title: string;
  description: string;
};

export function ModulePage({ title, description }: ModulePageProps) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Module</p>
        <h1 className="mt-1 text-2xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </CardHeader>

      <CardContent>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          This module route is active and ready for feature implementation.
        </div>
      </CardContent>
    </Card>
  );
}
