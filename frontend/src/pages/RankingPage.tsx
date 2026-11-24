import { Link, useSearchParams } from 'react-router';
import { useApi } from '../useApi';
import { LoadError, Loading } from '../components/RequestStatus';

interface Row {
  name: string;
  slug: string;
  lab: string;
  rank: number | null;
  score: number | null;
  otherRank: number | null;
}

function Ranking({ kind }: { kind: string }) {
  const [state, retry] = useApi<{ models: Row[] }>(`/rankings?kind=${kind}`);
  if (state.status === 'loading') return <Loading label="Loading ranking…" />;
  if (state.status === 'error')
    return (
      <LoadError message="The ranking could not be loaded." onRetry={retry} />
    );
  const ranked = state.data.models.filter((row) => row.rank !== null);
  const unranked = state.data.models.filter((row) => row.rank === null);
  return (
    <>
      {ranked.length === 0 && <p>No ranked models yet</p>}
      {ranked.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <caption className="sr-only">{kind} ranking</caption>
            <thead>
              <tr>
                {['Rank', 'Model', 'Lab', 'Score', 'Other ranking'].map(
                  (label) => (
                    <th key={label} className="p-3">
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {ranked.map((row) => (
                <tr key={row.slug} className="border-t">
                  <td className="p-3">{row.rank}</td>
                  <td className="p-3">
                    <Link
                      to={`/models/${row.slug}`}
                      className="text-indigo-700 underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className="p-3">{row.lab}</td>
                  <td className="p-3">
                    {row.score === null ? 'Not available' : `${row.score}%`}
                  </td>
                  <td className="p-3">{row.otherRank ?? 'Not ranked'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {unranked.length > 0 && (
        <section className="mt-6">
          <h2 className="text-lg font-semibold">Not ranked</h2>
          <ul>
            {unranked.map((row) => (
              <li key={row.slug}>
                <Link
                  to={`/models/${row.slug}`}
                  className="text-indigo-700 underline"
                >
                  {row.name}
                </Link>{' '}
                — {row.lab}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function RankingPage() {
  const [params, setParams] = useSearchParams();
  const kind = params.get('kind') === 'community' ? 'community' : 'benchmarks';
  return (
    <section>
      <h1 className="mb-6 text-2xl font-bold">Ranking</h1>
      <div className="mb-6 flex gap-2" role="group" aria-label="Ranking type">
        {(['benchmarks', 'community'] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={kind === option}
            className={`rounded px-4 py-2 ${kind === option ? 'bg-indigo-700 text-white' : 'bg-white text-slate-700'}`}
            onClick={() => setParams({ kind: option })}
          >
            {option === 'benchmarks' ? 'Benchmarks' : 'Community'}
          </button>
        ))}
      </div>
      <Ranking key={kind} kind={kind} />
    </section>
  );
}
