import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContextOrThrow } from "@/lib/auth";
import { l, tableStatusLabel } from "@/lib/i18n";
import { getDashboardMetrics } from "@/lib/queries/dashboard";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const context = await getUserContextOrThrow();

  if (!context.restaurantId) {
    return (
      <AppShell
        context={context}
        title={l(context.locale, "Dashboard", "Panel")}
        subtitle={l(context.locale, "No restaurant selected", "Ningún restaurante seleccionado")}
      >
        <EmptyState
          title={l(context.locale, "No restaurant linked", "No hay restaurante vinculado")}
          description={l(context.locale, "Attach this account to a restaurant in restaurant_users before using operations.", "Vincula esta cuenta a un restaurante en restaurant_users antes de operar.")}
        />
      </AppShell>
    );
  }

  const [metrics, floorData] = await Promise.all([
    getDashboardMetrics(context.restaurantId),
    getRestaurantFloorData(context.restaurantId)
  ]);

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Executive Service Dashboard", "Panel ejecutivo de servicio")}
      subtitle={l(context.locale, "Premium control room for live hospitality performance", "Centro premium para rendimiento operativo en vivo")}
    >
      <div className="space-y-5">
        <Card className="overflow-hidden border-[#d3c1a1] bg-gradient-to-br from-[#f9f4ea] via-white to-[#eef3f9]">
          <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8a7046]">
                {l(context.locale, "Today's Service Intelligence", "Inteligencia de servicio de hoy")}
              </p>
              <h2 className="mt-3 text-4xl leading-tight text-[#1f2d43]">
                {l(context.locale, "Keep every shift sharp,", "Mantén cada turno preciso,")}
                <br />
                {l(context.locale, "calm, and profitable.", "calmo y rentable.")}
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                {l(
                  context.locale,
                  "Monitor real-time tables, kitchen throughput, and cash flow from one refined command center designed for high-pressure service.",
                  "Monitorea mesas en vivo, flujo de cocina y caja desde un centro diseñado para servicio bajo presión."
                )}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/85 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {l(context.locale, "Revenue today", "Ingresos de hoy")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{formatMoney(metrics.totalToday)}</p>
              </div>
              <div className="rounded-xl border border-white/85 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  {l(context.locale, "Open checks", "Cuentas abiertas")}
                </p>
                <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{metrics.openOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="stagger-list grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={l(context.locale, "Open Orders", "Pedidos abiertos")} value={`${metrics.openOrders}`} hint={l(context.locale, "Live across devices", "En vivo entre dispositivos")} />
          <StatCard label={l(context.locale, "Today Sales", "Ventas de hoy")} value={formatMoney(metrics.totalToday)} />
          <StatCard
            label={l(context.locale, "Occupied Tables", "Mesas ocupadas")}
            value={`${metrics.statusCounts.occupied ?? 0}`}
            hint={l(context.locale, "Tables currently seated", "Mesas actualmente con clientes")}
          />
          <StatCard
            label={l(context.locale, "Ready / Payment", "Listas / Cobro")}
            value={`${(metrics.statusCounts.ready ?? 0) + (metrics.statusCounts.needs_payment ?? 0)}`}
            hint={l(context.locale, "Actionable tables", "Mesas con acción")}
          />
        </div>

        <div className="stagger-list grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Card className="interactive-elevate overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>{l(context.locale, "Active Tables", "Mesas activas")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="luxury-scroll overflow-auto rounded-xl border border-[#dbcdb5]">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-[#f8efe0] text-left">
                    <tr>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">{l(context.locale, "Table", "Mesa")}</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">{l(context.locale, "Status", "Estado")}</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">{l(context.locale, "Waiter", "Mesero")}</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">{l(context.locale, "Action", "Acción")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {floorData.tables
                      .filter((table) => table.is_active)
                      .map((table) => (
                        <tr key={table.id} className="border-t border-[#ebdfcd] bg-white/70 hover:bg-[#fff8eb]">
                          <td className="px-3 py-2 font-medium">
                            {table.table_code} · {table.display_name}
                          </td>
                          <td className="px-3 py-2 capitalize">
                            {tableStatusLabel(context.locale, table.status)}
                          </td>
                          <td className="px-3 py-2">
                            {table.assigned_waiter_name ?? l(context.locale, "Unassigned", "Sin asignar")}
                          </td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/orders/${table.id}`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              {l(context.locale, "Open", "Abrir")}
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="interactive-elevate">
            <CardHeader>
              <CardTitle>{l(context.locale, "Operator Shortcuts", "Atajos operativos")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/floor" className={buttonVariants({ variant: "default" })}>
                {l(context.locale, "Open Floor Operations", "Abrir operaciones de salón")}
              </Link>
              <Link href="/kitchen" className={buttonVariants({ variant: "outline" })}>
                {l(context.locale, "Kitchen Queue", "Cola de cocina")}
              </Link>
              <Link href="/checkout" className={buttonVariants({ variant: "outline" })}>
                {l(context.locale, "Checkout Desk", "Caja")}
              </Link>
              <Link href="/reports" className={buttonVariants({ variant: "outline" })}>
                {l(context.locale, "Sales Reports", "Reportes de ventas")}
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
