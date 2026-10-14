import type { LabsResponse } from '@aimc/shared';
import { Link } from 'react-router';
import LabLogo from '../components/LabLogo';
import { LoadError, Loading } from '../components/RequestStatus';
import { useApi } from '../useApi';

export default function ModelsPage() {
  const [state, retry] = useApi<LabsResponse>('/labs');

  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Models</h1>
      {state.status === 'loading' && <Loading label="Loading labs…" />}
      {state.status === 'error' && (
        <LoadError message="The labs could not be loaded." onRetry={retry} />
      )}
      {state.status === 'success' &&
        (state.data.labs.length === 0 ? (
          <p className="text-slate-500">No labs available yet</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {state.data.labs.map((lab) => (
              <li
                key={lab.name}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <LabLogo name={lab.name} logoUrl={lab.logoUrl} />
                  <h2 className="text-lg font-semibold">{lab.name}</h2>
                </div>
                {lab.models.length === 0 ? (
                  <p className="mt-3 text-sm text-slate-500">
                    No models available yet
                  </p>
                ) : (
                  <ul className="mt-3 space-y-1">
                    {lab.models.map((model) => (
                      <li key={model.slug}>
                        <Link
                          to={`/models/${model.slug}`}
                          className="block rounded-md px-2 py-1.5 text-indigo-700 hover:bg-indigo-50 hover:underline"
                        >
                          {model.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ))}
    </section>
  );
}
