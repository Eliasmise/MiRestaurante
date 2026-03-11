import { AppShell } from "@/components/layout/app-shell";
import { WaiterAssignments } from "@/components/floor/waiter-assignments";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import type { FloorTable } from "@/lib/types";

export default async function AssignmentsPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const data = await getRestaurantFloorData(context.restaurantId!);
  const tables = data.tables as FloorTable[];
  const waiters = data.waiters as Array<{ user_id: string; full_name: string }>;

  return (
    <AppShell
      context={context}
      title="Waiter Assignment"
      subtitle="Assign tables and maintain section coverage"
    >
      <WaiterAssignments tables={tables} waiters={waiters} />
    </AppShell>
  );
}
