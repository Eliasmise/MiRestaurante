import { AppShell } from "@/components/layout/app-shell";
import { FloorOperationalView } from "@/components/floor/floor-operational-view";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserContextOrThrow } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { getRestaurantFloorData } from "@/lib/queries/floor";
import type { FloorTable } from "@/lib/types";

export default async function FloorPage() {
  const context = await getUserContextOrThrow();

  if (!context.restaurantId) {
    return (
      <AppShell
        context={context}
        title={l(context.locale, "Floor", "Salón")}
        subtitle={l(context.locale, "No restaurant selected", "Ningún restaurante seleccionado")}
      >
        <EmptyState
          title={l(context.locale, "No restaurant assigned", "No hay restaurante asignado")}
          description={l(context.locale, "Assign this user to a restaurant to access floor operations.", "Asigna este usuario a un restaurante para acceder al salón.")}
        />
      </AppShell>
    );
  }

  const floorData = await getRestaurantFloorData(context.restaurantId);
  const tables = floorData.tables as FloorTable[];

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Floor Operations", "Operaciones de salón")}
      subtitle={l(context.locale, "Live visual table map with instant order access", "Mapa visual en vivo con acceso inmediato al pedido")}
    >
      <FloorOperationalView
        restaurantId={context.restaurantId}
        userId={context.userId}
        role={context.role}
        locale={context.locale}
        floors={floorData.floors}
        tables={tables}
      />
    </AppShell>
  );
}
