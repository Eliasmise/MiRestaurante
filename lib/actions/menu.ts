"use server";

import { revalidatePath } from "next/cache";

import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  menuCategorySchema,
  menuItemSchema,
  menuSubcategorySchema
} from "@/lib/validators/menu";

export async function upsertMenuCategory(input: unknown) {
  const parsed = menuCategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid category payload / Payload de categoría inválido" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error } = await supabase.from("menu_categories").upsert(
    {
      id: parsed.data.id,
      restaurant_id: parsed.data.restaurantId,
      name: parsed.data.name,
      slug: parsed.data.slug,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
      updated_by: context.userId
    },
    { onConflict: "id" }
  );

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/menu");
  return { success: true as const };
}

export async function upsertMenuSubcategory(input: unknown) {
  const parsed = menuSubcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid subcategory payload / Payload de subcategoría inválido" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error } = await supabase.from("menu_subcategories").upsert(
    {
      id: parsed.data.id,
      restaurant_id: parsed.data.restaurantId,
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
      updated_by: context.userId
    },
    { onConflict: "id" }
  );

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/menu");
  return { success: true as const };
}

export async function upsertMenuItem(input: unknown) {
  const parsed = menuItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error } = await supabase.from("menu_items").upsert(
    {
      id: parsed.data.id,
      restaurant_id: parsed.data.restaurantId,
      category_id: parsed.data.categoryId,
      subcategory_id: parsed.data.subcategoryId ?? null,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      prep_station: parsed.data.prepStation ?? null,
      tax_rate: parsed.data.taxRate,
      sort_order: parsed.data.sortOrder,
      image_url: parsed.data.imageUrl ?? null,
      is_active: parsed.data.isActive,
      updated_by: context.userId
    },
    { onConflict: "id" }
  );

  if (error) return { success: false as const, error: error.message };

  revalidatePath("/menu");
  return { success: true as const };
}
