import { headers } from "next/headers";

import { LoginForm } from "@/components/layout/login-form";
import { l, localeOrDefault } from "@/lib/i18n";

export default async function LoginPage() {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language");
  const locale = localeOrDefault(acceptLanguage?.toLowerCase().startsWith("es") ? "es" : "en");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f9f4e9] via-[#fdfbf7] to-[#efe4d2]" />
      <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-[#b89b67]/20 blur-3xl" />
      <div className="absolute -right-24 bottom-12 h-96 w-96 rounded-full bg-[#184270]/20 blur-3xl" />

      <div className="relative z-10 grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="hidden rounded-3xl border border-white/70 bg-white/55 p-10 shadow-luxe backdrop-blur lg:block">
          <p className="text-xs uppercase tracking-[0.3em] text-[#8a7046]">Mi Restaurante OS</p>
          <h1 className="mt-4 text-5xl leading-[1.1] text-[#1f2d43]">
            {l(locale, "Hospitality operations", "Operaciones de hospitalidad")}
            <br />
            {l(locale, "with executive precision", "con precisión ejecutiva")}
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            {l(
              locale,
              "A premium command center for service, kitchen throughput, staffing discipline, and real-time sales intelligence.",
              "Un centro premium para servicio, flujo de cocina, disciplina de personal e inteligencia de ventas en tiempo real."
            )}
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: l(locale, "Floor latency", "Latencia de salón"), value: l(locale, "< 1s sync", "Sincronía < 1s") },
              { label: l(locale, "Kitchen flow", "Flujo de cocina"), value: l(locale, "Live status", "Estado en vivo") },
              { label: l(locale, "Sales visibility", "Visibilidad de ventas"), value: l(locale, "Executive-grade", "Nivel ejecutivo") }
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
              {l(locale, "Service control in real time", "Control de servicio en tiempo real")}
            </h1>
          </div>
          <div className="surface-fade">
            <LoginForm locale={locale} />
          </div>
        </div>
      </div>
    </main>
  );
}
