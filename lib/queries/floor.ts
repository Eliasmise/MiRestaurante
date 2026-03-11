import { createClient } from "@/lib/supabase/server";

export async function getRestaurantFloorData(restaurantId: string) {
  const supabase = await createClient();

  const [{ data: floors }, { data: tables }, { data: waiters }, { data: staff }] = await Promise.all([
    supabase
      .from("floors")
      .select("id, name, width, height")
      .eq("restaurant_id", restaurantId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("floor_tables")
      .select("id, restaurant_id, floor_id, section_id, table_code, display_name, shape, pos_x, pos_y, width, height, seats, is_active, status, assigned_waiter_id")
      .eq("restaurant_id", restaurantId)
      .order("table_code", { ascending: true }),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name")
      .eq("restaurant_id", restaurantId)
      .eq("role", "waiter")
      .eq("active", true),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name")
      .eq("restaurant_id", restaurantId)
      .eq("active", true)
  ]);

  const staffMap = new Map((staff ?? []).map((member) => [member.user_id, member.full_name]));

  return {
    floors: floors ?? [],
    tables:
      tables?.map((table) => ({
        ...table,
        assigned_waiter_name: table.assigned_waiter_id
          ? staffMap.get(table.assigned_waiter_id) ?? null
          : null
      })) ?? [],
    waiters: waiters ?? []
  };
}
