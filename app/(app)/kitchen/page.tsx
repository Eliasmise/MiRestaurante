import { AppShell } from "@/components/layout/app-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { KitchenBoard, type KitchenItem } from "@/components/kitchen/kitchen-board";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { getKitchenQueue } from "@/lib/queries/kitchen";

export default async function KitchenPage() {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["kitchen", "manager", "super_admin"]);

  const queue = await getKitchenQueue(context.restaurantId!);
  const typedQueue: KitchenItem[] = queue.map((item) => {
    const menuItem = Array.isArray(item.menu_items) ? item.menu_items[0] ?? null : item.menu_items;
    const orderData = Array.isArray(item.orders) ? item.orders[0] ?? null : item.orders;
    const floorTable = orderData?.floor_table
      ? Array.isArray(orderData.floor_table)
        ? orderData.floor_table[0] ?? null
        : orderData.floor_table
      : null;

    return {
      id: item.id,
      order_id: item.order_id,
      quantity: item.quantity,
      status: item.status,
      note: item.note,
      modifier_summary: item.modifier_summary,
      sent_to_kitchen_at: item.sent_to_kitchen_at,
      kitchen_started_at: item.kitchen_started_at,
      ready_at: item.ready_at,
      menu_items: menuItem
        ? {
            name: menuItem.name,
            prep_station: menuItem.prep_station
          }
        : null,
      orders: orderData
        ? {
            order_number: orderData.order_number,
            floor_table: floorTable
              ? {
                  table_code: floorTable.table_code
                }
              : null,
            waiter: {
              full_name: orderData.waiter?.full_name ?? "-"
            }
          }
        : null
    };
  });

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Kitchen Display", "Pantalla de cocina")}
      subtitle={l(context.locale, "Real-time ticket queue and prep control", "Cola de tickets en tiempo real y control de preparación")}
    >
      {queue.length === 0 ? (
        <EmptyState
          title={l(context.locale, "Kitchen is clear", "Cocina sin pendientes")}
          description={l(context.locale, "No submitted items right now. New tickets will appear automatically.", "No hay ítems enviados ahora. Los nuevos tickets aparecerán automáticamente.")}
        />
      ) : (
        <KitchenBoard restaurantId={context.restaurantId!} items={typedQueue} locale={context.locale} />
      )}
    </AppShell>
  );
}
