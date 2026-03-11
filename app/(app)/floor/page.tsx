import { AppShell } from "@/components/layout/app-shell";
import { FloorOperationalView } from "@/components/floor/floor-operational-view";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserContextOrThrow } from "@/lib/auth";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import type { FloorTable } from "@/lib/types";

export default async function FloorPage() {
  const context = await getUserContextOrThrow();

  if (!context.restaurantId) {
    return (
      <AppShell context={context} title="Floor" subtitle="No restaurant selected">
        <EmptyState
          title="No restaurant assigned"
          description="Assign this user to a restaurant to access floor operations."
        />
      </AppShell>
    );
  }

  const floorData = await getRestaurantFloorData(context.restaurantId);
  const tables = floorData.tables as FloorTable[];

  return (
    <AppShell
      context={context}
      title="Floor Operations"
      subtitle="Live visual table map with instant order access"
    >
      <FloorOperationalView
        restaurantId={context.restaurantId}
        userId={context.userId}
        role={context.role}
        floors={floorData.floors}
        tables={tables}
      />
    </AppShell>
  );
}
