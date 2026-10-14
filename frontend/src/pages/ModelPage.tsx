import type { BenchmarkResult, ModelDetail } from '@aimc/shared';
import { Link, useParams } from 'react-router';
import { ApiError } from '../api';
import LabLogo from '../components/LabLogo';
import { LoadError, Loading } from '../components/RequestStatus';
import { formatDate, formatDateTime, formatPercent } from '../format';
import { useApi } from '../useApi';
import NotFoundPage from './NotFoundPage';

const formatRank = (rank: number | null) =>
  rank === null ? 'Not ranked' : `#${rank}`;

function BenchmarkTable({ results }: { results: BenchmarkResult[] }) {
  const cell =
    'block py-1 before:mr-2 before:font-medium before:text-slate-500 before:content-[attr(data-label)] sm:table-cell sm:px-3 sm:py-2 sm:before:content-none';

  return (
    <table className="w-full text-left text-sm">
      <thead className="hidden border-b border-slate-200 text-slate-500 sm:table-header-group">
        <tr>
          <th className="px-3 py-2 font-medium">Benchmark</th>
          <th className="px-3 py-2 font-medium">Score</th>
          <th className="px-3 py-2 font-medium">Source</th>
          <th className="px-3 py-2 font-medium">Imported</th>
        </tr>
      </thead>
      <tbody>
        {results.map((result) => (
          <tr
            key={result.benchmark}
            className="block border-b border-slate-100 py-3 sm:table-row sm:py-0"
          >
            <td data-label="Benchmark" className={`${cell} font-medium`}>
              {result.benchmark}
            </td>
            <td data-label="Score" className={cell}>
              {formatPercent(result.value)}
            </td>
            <td data-label="Source" className={cell}>
              <a
                href={result.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-700 hover:underline"
              >
                {result.source.name}
              </a>
            </td>
            <td data-label="Imported" className={cell}>
              <time dateTime={result.fetchedAt}>
                {formatDateTime(result.fetchedAt)}
              </time>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ModelDetails({ model }: { model: ModelDetail }) {
  return (
    <article className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {model.name}
        </h1>
        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <dt className="text-slate-500">Lab</dt>
            <dd className="flex items-center gap-2 font-medium">
              <LabLogo
                name={model.lab.name}
                logoUrl={model.lab.logoUrl}
                size="sm"
              />
              {model.lab.name}
            </dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-slate-500">Released</dt>
            <dd className="font-medium">
              {model.releaseDate === null ? (
                'Unknown'
              ) : (
                <time dateTime={model.releaseDate}>
                  {formatDate(model.releaseDate)}
                </time>
              )}
            </dd>
          </div>
        </dl>
      </header>

      <section aria-labelledby="ranks">
        <h2 id="ranks" className="sr-only">
          Ranks
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">Benchmark rank</dt>
            <dd className="mt-1 text-xl font-semibold">
              {formatRank(model.benchmarkRank)}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <dt className="text-sm text-slate-500">Community rank</dt>
            <dd className="mt-1 text-xl font-semibold">
              {formatRank(model.communityRank)}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="benchmarks">
        <h2 id="benchmarks" className="mb-3 text-lg font-semibold">
          Benchmark results
        </h2>
        {model.benchmarks.length === 0 ? (
          <p className="text-slate-500">No benchmark results available yet</p>
        ) : (
          <BenchmarkTable results={model.benchmarks} />
        )}
      </section>

      <section aria-labelledby="community">
        <h2 id="community" className="mb-3 text-lg font-semibold">
          Community
        </h2>
        <p className={model.communityScore === null ? 'text-slate-500' : ''}>
          {model.communityScore === null
            ? 'No votes yet'
            : `${formatPercent(model.communityScore)} up`}
        </p>
      </section>
    </article>
  );
}

function ModelContent({ slug }: { slug: string }) {
  const [state, retry] = useApi<ModelDetail>(
    `/models/${encodeURIComponent(slug)}`,
  );

  if (state.status === 'loading') {
    return <Loading label="Loading model…" />;
  }
  if (state.status === 'error') {
    // 400 (malformed slug) and 404 both mean that no model has this URL.
    if (
      state.error instanceof ApiError &&
      (state.error.status === 404 || state.error.status === 400)
    ) {
      return <NotFoundPage title="Model not found" />;
    }
    return (
      <LoadError message="The model could not be loaded." onRetry={retry} />
    );
  }
  return <ModelDetails model={state.data} />;
}

export default function ModelPage() {
  const { slug = '' } = useParams();

  return (
    <>
      <Link
        to="/models"
        className="mb-6 inline-block text-sm font-medium text-indigo-700 hover:underline"
      >
        ← All models
      </Link>
      <ModelContent key={slug} slug={slug} />
    </>
  );
}
