"use server";

import { revalidatePath } from "next/cache";

import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { restaurantSettingsSchema, staffRoleSchema } from "@/lib/validators/settings";

export async function updateRestaurantSettings(input: unknown) {
  const parsed = restaurantSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid settings payload / Payload de configuración inválido" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error: restaurantError } = await supabase
    .from("restaurants")
    .update({ name: parsed.data.name, updated_by: context.userId })
    .eq("id", parsed.data.restaurantId);

  if (restaurantError) {
    return { success: false as const, error: restaurantError.message };
  }

  const { error: settingsError } = await supabase.from("restaurant_settings").upsert(
    {
      restaurant_id: parsed.data.restaurantId,
      currency_code: parsed.data.currencyCode,
      tax_percent: parsed.data.taxPercent,
      service_charge_percent: parsed.data.serviceChargePercent,
      allow_waiter_close_table: parsed.data.allowWaiterCloseTable,
      language: parsed.data.language,
      updated_by: context.userId
    },
    { onConflict: "restaurant_id" }
  );

  if (settingsError) {
    return { success: false as const, error: settingsError.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");

  return { success: true as const };
}

export async function updateStaffRole(input: unknown) {
  const parsed = staffRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid staff payload / Payload de personal inválido" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error } = await supabase
    .from("restaurant_users")
    .update({ role: parsed.data.role, active: parsed.data.active, updated_by: context.userId })
    .eq("user_id", parsed.data.userId)
    .eq("restaurant_id", parsed.data.restaurantId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/staff");

  return { success: true as const };
}
