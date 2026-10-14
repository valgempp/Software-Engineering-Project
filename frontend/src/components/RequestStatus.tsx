export function Loading({ label }: { label: string }) {
  return (
    <p role="status" className="text-slate-500">
      {label}
    </p>
  );
}

export function LoadError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-red-800"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-white px-3 py-1.5 text-sm font-medium shadow-sm ring-1 ring-red-200 hover:bg-red-100"
      >
        Retry
      </button>
    </div>
  );
}
