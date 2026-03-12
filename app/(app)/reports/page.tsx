import { AppShell } from "@/components/layout/app-shell";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { getReportsData } from "@/lib/queries/reports";

export default async function ReportsPage({
  searchParams
}: {
  searchParams: Promise<{
    from?: string;
    to?: string;
    waiter?: string;
    payment?: string;
  }>;
}) {
  const params = await searchParams;
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getReportsData({
    restaurantId: context.restaurantId!,
    from: params.from,
    to: params.to,
    waiterId: params.waiter,
    paymentMethod: params.payment
  });

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Executive Reporting Suite", "Suite ejecutiva de reportes")}
      subtitle={l(context.locale, "Polished financial and operational intelligence", "Inteligencia financiera y operativa")}
    >
      <Card className="mb-4 border-[#d5c39f] bg-gradient-to-r from-[#faf3e7] to-[#f5f8fc]">
        <CardHeader className="pb-2">
          <CardTitle>{l(context.locale, "Filters", "Filtros")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" method="GET">
            <input
              type="date"
              name="from"
              defaultValue={params.from?.slice(0, 10)}
              className="h-10 rounded-xl border border-input bg-white/85 px-3 text-sm"
            />
            <input
              type="date"
              name="to"
              defaultValue={params.to?.slice(0, 10)}
              className="h-10 rounded-xl border border-input bg-white/85 px-3 text-sm"
            />
            <select
              name="payment"
              defaultValue={params.payment ?? ""}
              className="h-10 rounded-xl border border-input bg-white/85 px-3 text-sm"
            >
              <option value="">{l(context.locale, "All payments", "Todos los pagos")}</option>
              <option value="cash">{l(context.locale, "Cash", "Efectivo")}</option>
              <option value="card">{l(context.locale, "Card", "Tarjeta")}</option>
              <option value="transfer">{l(context.locale, "Transfer", "Transferencia")}</option>
              <option value="other">{l(context.locale, "Other", "Otro")}</option>
            </select>
            <button className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              {l(context.locale, "Apply", "Aplicar")}
            </button>
          </form>
        </CardContent>
      </Card>

      <ReportsDashboard {...data} locale={context.locale} />
    </AppShell>
  );
}
