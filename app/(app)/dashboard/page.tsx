import Link from "next/link";

import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { StatCard } from "@/components/shared/stat-card";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContextOrThrow } from "@/lib/auth";
import { getDashboardMetrics } from "@/lib/queries/dashboard";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import { formatMoney } from "@/lib/utils";

export default async function DashboardPage() {
  const context = await getUserContextOrThrow();

  if (!context.restaurantId) {
    return (
      <AppShell context={context} title="Dashboard" subtitle="No restaurant selected">
        <EmptyState
          title="No restaurant linked"
          description="Attach this account to a restaurant in restaurant_users before using operations."
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
      title="Executive Service Dashboard"
      subtitle="Premium control room for live hospitality performance"
    >
      <div className="space-y-5">
        <Card className="overflow-hidden border-[#d3c1a1] bg-gradient-to-br from-[#f9f4ea] via-white to-[#eef3f9]">
          <CardContent className="grid gap-5 p-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#8a7046]">Today&apos;s Service Intelligence</p>
              <h2 className="mt-3 text-4xl leading-tight text-[#1f2d43]">
                Keep every shift sharp,
                <br />
                calm, and profitable.
              </h2>
              <p className="mt-3 max-w-xl text-sm text-muted-foreground">
                Monitor real-time tables, kitchen throughput, and cash flow from one refined command center designed for high-pressure service.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/85 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Revenue today</p>
                <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{formatMoney(metrics.totalToday)}</p>
              </div>
              <div className="rounded-xl border border-white/85 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Open checks</p>
                <p className="mt-1 text-2xl font-semibold text-[#1f2d43]">{metrics.openOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="stagger-list grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Open Orders" value={`${metrics.openOrders}`} hint="Live across devices" />
          <StatCard label="Today Sales" value={formatMoney(metrics.totalToday)} />
          <StatCard
            label="Occupied Tables"
            value={`${metrics.statusCounts.occupied ?? 0}`}
            hint="Tables currently seated"
          />
          <StatCard
            label="Ready / Payment"
            value={`${(metrics.statusCounts.ready ?? 0) + (metrics.statusCounts.needs_payment ?? 0)}`}
            hint="Actionable tables"
          />
        </div>

        <div className="stagger-list grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Card className="interactive-elevate overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle>Active Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="luxury-scroll overflow-auto rounded-xl border border-[#dbcdb5]">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-[#f8efe0] text-left">
                    <tr>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">Table</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">Status</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">Waiter</th>
                      <th className="px-3 py-2 text-xs uppercase tracking-[0.14em] text-[#82653f]">Action</th>
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
                            {table.status.replaceAll("_", " ")}
                          </td>
                          <td className="px-3 py-2">{table.assigned_waiter_name ?? "Unassigned"}</td>
                          <td className="px-3 py-2">
                            <Link
                              href={`/orders/${table.id}`}
                              className={buttonVariants({ variant: "outline", size: "sm" })}
                            >
                              Open
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
              <CardTitle>Operator Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link href="/floor" className={buttonVariants({ variant: "default" })}>
                Open Floor Operations
              </Link>
              <Link href="/kitchen" className={buttonVariants({ variant: "outline" })}>
                Kitchen Queue
              </Link>
              <Link href="/checkout" className={buttonVariants({ variant: "outline" })}>
                Checkout Desk
              </Link>
              <Link href="/reports" className={buttonVariants({ variant: "outline" })}>
                Sales Reports
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
