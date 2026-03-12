import { AppShell } from "@/components/layout/app-shell";
import { WaiterAssignments } from "@/components/floor/waiter-assignments";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
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
      title={l(context.locale, "Waiter Assignment", "Asignación de meseros")}
      subtitle={l(context.locale, "Assign tables and maintain section coverage", "Asigna mesas y mantiene cobertura por sección")}
    >
      <WaiterAssignments tables={tables} waiters={waiters} locale={context.locale} />
    </AppShell>
  );
}
