export default function AppLoading() {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="hidden h-screen w-[18rem] border-r border-white/70 bg-gradient-to-b from-[#fdfaf2]/90 to-[#f3ece0]/70 p-4 lg:block">
        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-10 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </aside>
      <div className="flex-1 p-4 md:p-8">
        <div className="mx-auto w-full max-w-[1500px] space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-muted" />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-28 animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="h-80 animate-pulse rounded-2xl bg-muted" />
            <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
