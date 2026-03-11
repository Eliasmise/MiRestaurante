import { redirect } from "next/navigation";

import { FloorEditor } from "@/components/floor/floor-editor";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import type { FloorTable } from "@/lib/types";

export default async function FloorEditorPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  if (!context.restaurantId) {
    redirect("/dashboard");
  }

  const floorData = await getRestaurantFloorData(context.restaurantId);
  const floor = floorData.floors[0];
  const tables = floorData.tables as FloorTable[];

  return (
    <AppShell
      context={context}
      title="Floor Layout Editor"
      subtitle="Drag, resize and organize tables visually"
    >
      {!floor ? (
        <EmptyState
          title="No floor exists"
          description="Create at least one floor in the seed or SQL migration first."
        />
      ) : (
        <FloorEditor
          restaurantId={context.restaurantId}
          floor={floor}
          initialTables={tables.filter((table) => table.floor_id === floor.id)}
        />
      )}
    </AppShell>
  );
}
