import { redirect } from "next/navigation";

import { FloorEditor } from "@/components/floor/floor-editor";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
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
      title={l(context.locale, "Floor Layout Editor", "Editor de plano de salón")}
      subtitle={l(context.locale, "Drag, resize and organize tables visually", "Arrastra, redimensiona y organiza mesas visualmente")}
    >
      {!floor ? (
        <EmptyState
          title={l(context.locale, "No floor exists", "No existe un salón")}
          description={l(context.locale, "Create at least one floor in the seed or SQL migration first.", "Crea al menos un salón en el seed o migración SQL.")}
        />
      ) : (
        <FloorEditor
          restaurantId={context.restaurantId}
          locale={context.locale}
          floor={floor}
          initialTables={tables.filter((table) => table.floor_id === floor.id)}
        />
      )}
    </AppShell>
  );
}
