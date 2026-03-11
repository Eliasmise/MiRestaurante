import { notFound } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import {
  TableOrderWorkspace,
  type OrderWorkspaceProps
} from "@/components/orders/table-order-workspace";
import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { getMenuData } from "@/lib/queries/menu";
import { getTableOrderSnapshot } from "@/lib/queries/orders";
import { createClient } from "@/lib/supabase/server";

export default async function TableOrderPage({ params }: { params: Promise<{ tableId: string }> }) {
  const { tableId } = await params;
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "cashier", "super_admin"]);

  if (!context.restaurantId) {
    notFound();
  }

  const [snapshot, menuData, supabase] = await Promise.all([
    getTableOrderSnapshot(context.restaurantId, tableId),
    getMenuData(context.restaurantId),
    createClient()
  ]);

  if (!snapshot.table) {
    notFound();
  }

  const table: OrderWorkspaceProps["table"] = {
    table_code: snapshot.table.table_code,
    display_name: snapshot.table.display_name,
    status: snapshot.table.status
  };

  const order: OrderWorkspaceProps["order"] = snapshot.order
    ? {
        id: snapshot.order.id,
        status: snapshot.order.status,
        order_number: snapshot.order.order_number,
        subtotal: Number(snapshot.order.subtotal),
        tax_total: Number(snapshot.order.tax_total),
        service_charge_total: Number(snapshot.order.service_charge_total),
        discount_total: Number(snapshot.order.discount_total),
        total: Number(snapshot.order.total)
      }
    : null;

  const items: OrderWorkspaceProps["items"] = (snapshot.items ?? []).map((item) => ({
    id: item.id,
    quantity: item.quantity,
    unit_price: Number(item.unit_price),
    item_total: Number(item.item_total),
    status: item.status,
    note: item.note,
    modifier_summary: item.modifier_summary,
    menu_items: Array.isArray(item.menu_items) ? item.menu_items[0] ?? null : item.menu_items
  }));

  const categories: OrderWorkspaceProps["categories"] = menuData.categories.map((category) => ({
    id: category.id,
    name: category.name
  }));
  const subcategories: OrderWorkspaceProps["subcategories"] = menuData.subcategories.map(
    (subcategory) => ({
      id: subcategory.id,
      category_id: subcategory.category_id,
      name: subcategory.name
    })
  );
  const menuItems: OrderWorkspaceProps["menuItems"] = menuData.items.map((item) => ({
    id: item.id,
    category_id: item.category_id,
    subcategory_id: item.subcategory_id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    is_active: item.is_active
  }));

  const menuItemIds = menuData.items.map((item) => item.id);

  const { data: mappingRows } = await supabase
    .from("menu_item_modifier_groups")
    .select(
      "menu_item_id, modifier_groups(id, name, is_required, min_select, max_select, options:modifier_options(id, name, price_delta, is_active))"
    )
    .eq("restaurant_id", context.restaurantId)
    .in("menu_item_id", menuItemIds);

  const modifierMap: OrderWorkspaceProps["modifierMap"] = {};
  (mappingRows ?? []).forEach((row) => {
    const key = row.menu_item_id;
    if (!modifierMap[key]) modifierMap[key] = [];
    const group = Array.isArray(row.modifier_groups)
      ? row.modifier_groups[0]
      : row.modifier_groups;
    if (group) {
      modifierMap[key].push({
        id: group.id,
        name: group.name,
        is_required: group.is_required,
        min_select: group.min_select,
        max_select: group.max_select,
        options: (group.options ?? []).map((option) => ({
          id: option.id,
          name: option.name,
          price_delta: Number(option.price_delta),
          is_active: option.is_active
        }))
      });
    }
  });

  return (
    <AppShell
      context={context}
      title={`Table ${snapshot.table.table_code}`}
      subtitle="Build and manage this table order"
    >
      <TableOrderWorkspace
        restaurantId={context.restaurantId}
        tableId={tableId}
        table={table}
        order={order}
        items={items}
        categories={categories}
        subcategories={subcategories}
        menuItems={menuItems}
        modifierMap={modifierMap}
      />
    </AppShell>
  );
}
