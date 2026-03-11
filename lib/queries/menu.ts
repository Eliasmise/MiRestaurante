import { createClient } from "@/lib/supabase/server";

export async function getMenuData(restaurantId: string) {
  const supabase = await createClient();

  const [{ data: categories }, { data: subcategories }, { data: items }, { data: modifierGroups }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("id, name, slug, sort_order, is_active")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_subcategories")
        .select("id, category_id, name, sort_order, is_active")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("menu_items")
        .select("id, category_id, subcategory_id, name, description, price, prep_station, tax_rate, sort_order, is_active")
        .eq("restaurant_id", restaurantId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("modifier_groups")
        .select("id, name, is_required, min_select, max_select, options:modifier_options(id, name, price_delta, is_active)")
        .eq("restaurant_id", restaurantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
    ]);

  return {
    categories: categories ?? [],
    subcategories: subcategories ?? [],
    items: items ?? [],
    modifierGroups: modifierGroups ?? []
  };
}

export async function getItemModifierGroups(restaurantId: string, menuItemId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("menu_item_modifier_groups")
    .select(
      "modifier_group_id, modifier_groups(id, name, is_required, min_select, max_select, options:modifier_options(id, name, price_delta, is_active))"
    )
    .eq("restaurant_id", restaurantId)
    .eq("menu_item_id", menuItemId)
    .order("sort_order", { ascending: true });

  return data ?? [];
}
