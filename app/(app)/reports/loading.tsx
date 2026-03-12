export default function ReportsLoading() {
  return (
    <div className="space-y-4">
      <div className="h-24 animate-pulse rounded-2xl bg-muted" />
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="h-28 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
        <div className="h-72 animate-pulse rounded-2xl bg-muted" />
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-muted" />
    </div>
  );
}
