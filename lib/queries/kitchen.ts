import { createClient } from "@/lib/supabase/server";

export async function getKitchenQueue(restaurantId: string) {
  const supabase = await createClient();

  const [{ data: rows }, { data: staff }] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, order_id, quantity, status, note, modifier_summary, sent_to_kitchen_at, kitchen_started_at, ready_at, menu_items(name, prep_station), orders(order_number, waiter_id, floor_table:floor_tables(table_code))"
      )
      .eq("restaurant_id", restaurantId)
      .in("status", ["submitted", "preparing", "ready"])
      .order("sent_to_kitchen_at", { ascending: true }),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
  ]);

  const waiterMap = new Map((staff ?? []).map((member) => [member.user_id, member.full_name]));

  return (
    rows?.map((row) => {
      const orderData = Array.isArray(row.orders) ? row.orders[0] : row.orders;
      return {
        ...row,
        orders: orderData
          ? {
              ...orderData,
              waiter: { full_name: waiterMap.get(orderData.waiter_id) ?? "-" }
            }
          : null
      };
    }) ?? []
  );
}
