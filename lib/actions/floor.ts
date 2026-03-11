"use server";

import { revalidatePath } from "next/cache";

import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { floorLayoutSchema, waiterAssignmentSchema } from "@/lib/validators/floor";

export async function saveFloorLayout(input: unknown) {
  const parsed = floorLayoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid floor payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();
  const { floorId, tables } = parsed.data;

  const { data: existing, error: existingError } = await supabase
    .from("floor_tables")
    .select("id")
    .eq("floor_id", floorId)
    .eq("restaurant_id", context.restaurantId);

  if (existingError) {
    return { success: false as const, error: existingError.message };
  }

  const incomingIds = new Set(tables.map((table) => table.id).filter(Boolean));
  const removeIds = (existing ?? [])
    .map((row) => row.id)
    .filter((id) => !incomingIds.has(id));

  if (removeIds.length > 0) {
    const { error: deleteError } = await supabase
      .from("floor_tables")
      .delete()
      .in("id", removeIds)
      .eq("restaurant_id", context.restaurantId);

    if (deleteError) {
      return { success: false as const, error: deleteError.message };
    }
  }

  const upsertRows = tables.map((table) => ({
    ...table,
    restaurant_id: context.restaurantId,
    floor_id: floorId,
    updated_by: context.userId
  }));

  const { error: upsertError } = await supabase
    .from("floor_tables")
    .upsert(upsertRows, { onConflict: "id" });

  if (upsertError) {
    return { success: false as const, error: upsertError.message };
  }

  revalidatePath("/floor/editor");
  revalidatePath("/floor");

  return { success: true as const };
}

export async function assignWaiterToTable(input: unknown) {
  const parsed = waiterAssignmentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid assignment payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "super_admin"]);

  const supabase = await createClient();

  const { error } = await supabase
    .from("floor_tables")
    .update({ assigned_waiter_id: parsed.data.waiterId })
    .eq("id", parsed.data.tableId)
    .eq("restaurant_id", context.restaurantId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/assignments");
  revalidatePath("/floor");

  return { success: true as const };
}
