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
      title="Service Dashboard"
      subtitle="Snapshot of current floor activity and sales"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

        <div className="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Active Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto rounded-xl border">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="bg-muted/40 text-left">
                    <tr>
                      <th className="px-3 py-2">Table</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Waiter</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {floorData.tables
                      .filter((table) => table.is_active)
                      .map((table) => (
                        <tr key={table.id} className="border-t">
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

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
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
