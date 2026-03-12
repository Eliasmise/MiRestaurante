import { LoginForm } from "@/components/layout/login-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f4e9] via-[#fdfbf7] to-[#efe4d2]" />
      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#b89b67]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-[#184270]/20 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="hidden rounded-3xl border border-white/70 bg-white/55 p-10 shadow-luxe backdrop-blur lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8a7046]">Mi Restaurante OS</p>
          <h1 className="mt-4 text-5xl leading-[1.1] text-[#1f2d43]">
            Hospitality operations
            <br />
            with executive precision
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            A premium command center for service, kitchen throughput, staffing discipline, and real-time sales intelligence.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: "Floor latency", value: "< 1s sync" },
              { label: "Kitchen flow", value: "Live status" },
              { label: "Sales visibility", value: "Executive-grade" }
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/80 bg-white/75 p-3">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-[#1f2d43]">{item.value}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full max-w-md justify-self-center">
          <div className="mb-6 text-center lg:hidden">
            <p className="text-xs uppercase tracking-[0.3em] text-[#8a7046]">Mi Restaurante OS</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#1f2d43]">
              Service control in real time
            </h1>
          </div>
          <div className="surface-fade">
            <LoginForm />
          </div>
        </div>
      </div>
    </main>
  );
}
