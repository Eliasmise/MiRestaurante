import { createClient } from "@/lib/supabase/server";

export async function getTableOrderSnapshot(restaurantId: string, tableId: string) {
  const supabase = await createClient();

  const { data: table } = await supabase
    .from("floor_tables")
    .select("id, table_code, display_name, seats, status")
    .eq("restaurant_id", restaurantId)
    .eq("id", tableId)
    .single();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, status, subtotal, tax_total, service_charge_total, discount_total, total, opened_at, submitted_at")
    .eq("restaurant_id", restaurantId)
    .eq("floor_table_id", tableId)
    .in("status", ["draft", "submitted", "in_preparation", "ready", "served"])
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) {
    return { table, order: null, items: [] };
  }

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, quantity, unit_price, item_total, status, note, modifier_summary, sent_to_kitchen_at, menu_items(name)"
    )
    .eq("restaurant_id", restaurantId)
    .eq("order_id", order.id)
    .order("created_at", { ascending: true });

  return {
    table,
    order,
    items: items ?? []
  };
}

export async function getOpenOrdersForCheckout(restaurantId: string) {
  const supabase = await createClient();

  const [{ data: data }, { data: staff }] = await Promise.all([
    supabase
    .from("orders")
      .select("id, order_number, total, status, opened_at, waiter_id, floor_table:floor_tables(table_code, display_name)")
    .eq("restaurant_id", restaurantId)
    .in("status", ["ready", "served", "submitted", "in_preparation"])
      .order("opened_at", { ascending: true }),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
  ]);

  const staffMap = new Map((staff ?? []).map((member) => [member.user_id, member.full_name]));

  return (
    data?.map((order) => ({
      ...order,
      waiter: {
        full_name: staffMap.get(order.waiter_id) ?? "-"
      }
    })) ?? []
  );
}
