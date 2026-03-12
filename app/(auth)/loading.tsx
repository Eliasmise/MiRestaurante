export default function AuthLoading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f4e9] via-[#fdfbf7] to-[#efe4d2]" />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/80 bg-white/80 p-6 shadow-luxe">
        <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-4 h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="mt-8 space-y-3">
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-10 animate-pulse rounded-xl bg-muted" />
          <div className="h-11 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </main>
  );
}
