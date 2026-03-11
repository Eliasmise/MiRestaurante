import { AppShell } from "@/components/layout/app-shell";
import { ReportsDashboard } from "@/components/reports/reports-dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
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
      title="Sales Reports"
      subtitle="Operational and executive reporting"
    >
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4" method="GET">
            <input
              type="date"
              name="from"
              defaultValue={params.from?.slice(0, 10)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            />
            <input
              type="date"
              name="to"
              defaultValue={params.to?.slice(0, 10)}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            />
            <select
              name="payment"
              defaultValue={params.payment ?? ""}
              className="h-10 rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option value="">All payments</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="transfer">Transfer</option>
              <option value="other">Other</option>
            </select>
            <button className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
              Apply
            </button>
          </form>
        </CardContent>
      </Card>

      <ReportsDashboard {...data} />
    </AppShell>
  );
}
