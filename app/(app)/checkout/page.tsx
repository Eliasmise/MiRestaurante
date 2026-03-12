import { AppShell } from "@/components/layout/app-shell";
import { CheckoutBoard, type OpenOrder } from "@/components/orders/checkout-board";
import { EmptyState } from "@/components/shared/empty-state";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { l } from "@/lib/i18n";
import { getOpenOrdersForCheckout } from "@/lib/queries/orders";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const params = await searchParams;
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "cashier", "waiter", "super_admin"]);

  const orders = await getOpenOrdersForCheckout(context.restaurantId!);
  const typedOrders: OpenOrder[] = orders.map((order) => {
    const floorTable = Array.isArray(order.floor_table)
      ? order.floor_table[0] ?? null
      : order.floor_table;
    return {
      id: order.id,
      order_number: order.order_number,
      total: Number(order.total),
      status: order.status,
      opened_at: order.opened_at,
      floor_table: floorTable
        ? {
            table_code: floorTable.table_code,
            display_name: floorTable.display_name
          }
        : null,
      waiter: {
        full_name: order.waiter?.full_name ?? "-"
      }
    };
  });

  return (
    <AppShell
      context={context}
      title={l(context.locale, "Checkout", "Cobro")}
      subtitle={l(context.locale, "Close bills and free tables quickly", "Cierra cuentas y libera mesas rápidamente")}
    >
      {orders.length === 0 ? (
        <EmptyState
          title={l(context.locale, "No open checks", "No hay cuentas abiertas")}
          description={l(context.locale, "Closed orders will immediately appear in reports.", "Los pedidos cerrados aparecerán de inmediato en reportes.")}
        />
      ) : (
        <CheckoutBoard orders={typedOrders} preselectedOrderId={params.order} locale={context.locale} />
      )}
    </AppShell>
  );
}
