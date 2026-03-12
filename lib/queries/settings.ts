import { createClient } from "@/lib/supabase/server";

export async function getRestaurantSettings(restaurantId: string) {
  const supabase = await createClient();

  const [{ data: restaurant }, { data: settings }, { data: staff }] = await Promise.all([
    supabase.from("restaurants").select("id, name").eq("id", restaurantId).single(),
    supabase
      .from("restaurant_settings")
      .select("currency_code, tax_percent, service_charge_percent, allow_waiter_close_table, language")
      .eq("restaurant_id", restaurantId)
      .maybeSingle(),
    supabase
      .from("restaurant_users")
      .select("user_id, full_name, role, active")
      .eq("restaurant_id", restaurantId)
      .order("full_name", { ascending: true })
  ]);

  return {
    restaurant,
    settings,
    staff: staff ?? []
  };
}
