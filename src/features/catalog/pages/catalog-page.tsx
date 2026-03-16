import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../../shared/components/ui/card';

const catalogModules = [
  {
    title: 'Products',
    description: 'Administra el catalogo de productos, su disponibilidad y el estado comercial.',
    to: '/catalog/products',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    title: 'Categories',
    description: 'Organiza categorias de negocio y clasificaciones para productos u otras entidades.',
    to: '/catalog/categories',
    accent: 'from-sky-500 to-cyan-500',
  },
];

export function CatalogPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Catalog</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">Catalog Hub</h1>
          <p className="mt-1 text-sm text-slate-600">
            Punto de entrada para los catalogos funcionales del sistema. Desde aqui puedes navegar a los modulos
            concretos que administran maestros del negocio.
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-4 text-sm text-slate-700">
            <p className="font-semibold text-violet-800">Como se entiende este modulo</p>
            <p className="mt-2">
              `Catalog` funciona como agrupador. Los catalogos reales viven en vistas especificas como `Products` y
              `Categories`.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {catalogModules.map((module) => (
              <Link
                key={module.title}
                to={module.to}
                className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md"
              >
                <div className={`h-2 w-24 rounded-full bg-gradient-to-r ${module.accent}`} />
                <h2 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-violet-700">{module.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                <p className="mt-4 text-sm font-medium text-violet-700">Abrir modulo</p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
