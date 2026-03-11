"use server";

import { revalidatePath } from "next/cache";

import { getUserContextOrThrow, requireRoles } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  addItemSchema,
  checkoutSchema,
  kitchenStatusSchema,
  removeItemSchema,
  sendToKitchenSchema,
  updateItemQuantitySchema
} from "@/lib/validators/order";

async function getOrCreateOpenOrder(tableId: string) {
  const context = await getUserContextOrThrow();
  const supabase = await createClient();

  if (!context.restaurantId) {
    throw new Error("No restaurant selected");
  }

  const { data: existing } = await supabase
    .from("orders")
    .select("id, status")
    .eq("restaurant_id", context.restaurantId)
    .eq("floor_table_id", tableId)
    .in("status", ["draft", "submitted", "in_preparation", "ready", "served"])
    .order("opened_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  const { data: latestOrder } = await supabase
    .from("orders")
    .select("order_number")
    .eq("restaurant_id", context.restaurantId)
    .order("order_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrderNumber = (latestOrder?.order_number ?? 0) + 1;

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      restaurant_id: context.restaurantId,
      floor_table_id: tableId,
      waiter_id: context.userId,
      order_number: nextOrderNumber,
      status: "draft",
      opened_at: new Date().toISOString(),
      created_by: context.userId,
      updated_by: context.userId
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase
    .from("floor_tables")
    .update({ status: "occupied", assigned_waiter_id: context.userId })
    .eq("id", tableId)
    .eq("restaurant_id", context.restaurantId);

  await supabase.from("audit_logs").insert({
    restaurant_id: context.restaurantId,
    actor_user_id: context.userId,
    action: "order_created",
    entity_type: "order",
    entity_id: order.id,
    metadata: { table_id: tableId }
  });

  return order.id;
}

export async function ensureTableOrder(tableId: string) {
  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "cashier", "super_admin"]);

  const orderId = await getOrCreateOpenOrder(tableId);

  revalidatePath(`/orders/${tableId}`);
  revalidatePath("/floor");

  return { success: true, orderId };
}

export async function addOrderItem(input: unknown) {
  const parsed = addItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.flatten().formErrors.join(", ") };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "cashier", "super_admin"]);

  const supabase = await createClient();
  const { tableId, menuItemId, quantity, note, modifiers } = parsed.data;

  const orderId = await getOrCreateOpenOrder(tableId);

  const { data: menuItem, error: menuError } = await supabase
    .from("menu_items")
    .select("id, name, price")
    .eq("id", menuItemId)
    .eq("restaurant_id", context.restaurantId)
    .eq("is_active", true)
    .single();

  if (menuError || !menuItem) {
    return { success: false as const, error: "Menu item not available" };
  }

  const modifierDelta = modifiers.reduce((sum, item) => sum + item.price_delta, 0);
  const itemTotal = (Number(menuItem.price) + modifierDelta) * quantity;

  const { data: orderItem, error: itemError } = await supabase
    .from("order_items")
    .insert({
      order_id: orderId,
      restaurant_id: context.restaurantId,
      menu_item_id: menuItem.id,
      quantity,
      unit_price: menuItem.price,
      item_total: itemTotal,
      status: "draft",
      note: note ?? null,
      modifier_summary: modifiers.map((m) => m.name).join(", ") || null,
      created_by: context.userId,
      updated_by: context.userId
    })
    .select("id")
    .single();

  if (itemError) {
    return { success: false as const, error: itemError.message };
  }

  if (modifiers.length > 0) {
    const modifierRows = modifiers.map((modifier) => ({
      restaurant_id: context.restaurantId,
      order_item_id: orderItem.id,
      modifier_option_id: modifier.modifier_option_id,
      name_snapshot: modifier.name,
      price_delta_snapshot: modifier.price_delta
    }));

    const { error: modifierError } = await supabase
      .from("order_item_modifiers")
      .insert(modifierRows);

    if (modifierError) {
      return { success: false as const, error: modifierError.message };
    }
  }

  await supabase
    .from("floor_tables")
    .update({ status: "ordering", assigned_waiter_id: context.userId })
    .eq("id", tableId)
    .eq("restaurant_id", context.restaurantId);

  await supabase
    .from("orders")
    .update({ updated_by: context.userId, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("restaurant_id", context.restaurantId);

  await supabase.from("audit_logs").insert({
    restaurant_id: context.restaurantId,
    actor_user_id: context.userId,
    action: "order_item_added",
    entity_type: "order_item",
    entity_id: orderItem.id,
    metadata: {
      menu_item_id: menuItem.id,
      table_id: tableId,
      quantity
    }
  });

  revalidatePath(`/orders/${tableId}`);
  revalidatePath("/floor");
  revalidatePath("/kitchen");

  return { success: true as const, orderId };
}

export async function sendOrderItemsToKitchen(input: unknown) {
  const parsed = sendToKitchenSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid kitchen request" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "cashier", "super_admin"]);

  const supabase = await createClient();
  const { orderId, itemIds } = parsed.data;
  const now = new Date().toISOString();

  let query = supabase
    .from("order_items")
    .update({ status: "submitted", sent_to_kitchen_at: now, updated_by: context.userId })
    .eq("order_id", orderId)
    .eq("restaurant_id", context.restaurantId)
    .eq("status", "draft");

  if (itemIds && itemIds.length > 0) {
    query = query.in("id", itemIds);
  }

  const { error } = await query;
  if (error) return { success: false as const, error: error.message };

  const { data: order } = await supabase
    .from("orders")
    .select("floor_table_id")
    .eq("id", orderId)
    .eq("restaurant_id", context.restaurantId)
    .single();

  await supabase
    .from("orders")
    .update({
      status: "submitted",
      submitted_at: now,
      updated_by: context.userId,
      updated_at: now
    })
    .eq("id", orderId)
    .eq("restaurant_id", context.restaurantId);

  if (order?.floor_table_id) {
    await supabase
      .from("floor_tables")
      .update({ status: "sent_to_kitchen" })
      .eq("id", order.floor_table_id)
      .eq("restaurant_id", context.restaurantId);
  }

  await supabase.from("audit_logs").insert({
    restaurant_id: context.restaurantId,
    actor_user_id: context.userId,
    action: "order_sent_to_kitchen",
    entity_type: "order",
    entity_id: orderId,
    metadata: { item_ids: itemIds ?? [] }
  });

  revalidatePath("/kitchen");
  revalidatePath("/floor");

  return { success: true as const };
}

async function syncOrderAndTableStatus(orderId: string, restaurantId: string, actorUserId: string) {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("order_items")
    .select("status")
    .eq("order_id", orderId)
    .eq("restaurant_id", restaurantId);

  const statuses = (items ?? []).map((i) => i.status as string);

  let nextOrderStatus: string = "submitted";
  let nextTableStatus: string = "sent_to_kitchen";

  if (statuses.length === 0) {
    nextOrderStatus = "draft";
    nextTableStatus = "occupied";
  } else if (statuses.every((s) => s === "ready" || s === "served" || s === "voided")) {
    nextOrderStatus = statuses.every((s) => s === "served" || s === "voided")
      ? "served"
      : "ready";
    nextTableStatus = nextOrderStatus === "served" ? "needs_payment" : "ready";
  } else if (statuses.some((s) => s === "preparing")) {
    nextOrderStatus = "in_preparation";
    nextTableStatus = "in_preparation";
  } else if (statuses.some((s) => s === "submitted")) {
    nextOrderStatus = "submitted";
    nextTableStatus = "sent_to_kitchen";
  }

  const { data: order } = await supabase
    .from("orders")
    .select("floor_table_id")
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId)
    .single();

  await supabase
    .from("orders")
    .update({ status: nextOrderStatus, updated_by: actorUserId, updated_at: new Date().toISOString() })
    .eq("id", orderId)
    .eq("restaurant_id", restaurantId);

  if (order?.floor_table_id) {
    await supabase
      .from("floor_tables")
      .update({ status: nextTableStatus })
      .eq("id", order.floor_table_id)
      .eq("restaurant_id", restaurantId);
  }
}

export async function updateKitchenItemStatus(input: unknown) {
  const parsed = kitchenStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid status payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["kitchen", "manager", "super_admin"]);

  const supabase = await createClient();
  const { orderItemId, status } = parsed.data;

  const patch: Record<string, string> = {
    status,
    updated_by: context.userId
  };

  const now = new Date().toISOString();
  if (status === "preparing") patch.kitchen_started_at = now;
  if (status === "ready") patch.ready_at = now;
  if (status === "served") patch.served_at = now;

  const { data: row, error } = await supabase
    .from("order_items")
    .update(patch)
    .eq("id", orderItemId)
    .eq("restaurant_id", context.restaurantId)
    .select("id, order_id")
    .single();

  if (error || !row) {
    return { success: false as const, error: error?.message ?? "Unable to update item" };
  }

  await syncOrderAndTableStatus(row.order_id, context.restaurantId!, context.userId);

  revalidatePath("/kitchen");
  revalidatePath("/floor");

  return { success: true as const };
}

export async function updateOrderItemQuantity(input: unknown) {
  const parsed = updateItemQuantitySchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid quantity payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "super_admin"]);

  const supabase = await createClient();
  const { orderItemId, quantity } = parsed.data;

  const { data: item } = await supabase
    .from("order_items")
    .select("id, status, unit_price, order_id")
    .eq("id", orderItemId)
    .eq("restaurant_id", context.restaurantId)
    .single();

  if (!item || item.status !== "draft") {
    return { success: false as const, error: "Only draft items can be edited" };
  }

  const { data: modifiers } = await supabase
    .from("order_item_modifiers")
    .select("price_delta_snapshot")
    .eq("order_item_id", orderItemId)
    .eq("restaurant_id", context.restaurantId);

  const modifierDelta = (modifiers ?? []).reduce(
    (sum, m) => sum + Number(m.price_delta_snapshot),
    0
  );

  const itemTotal = (Number(item.unit_price) + modifierDelta) * quantity;

  const { error } = await supabase
    .from("order_items")
    .update({ quantity, item_total: itemTotal, updated_by: context.userId })
    .eq("id", orderItemId)
    .eq("restaurant_id", context.restaurantId);

  if (error) {
    return { success: false as const, error: error.message };
  }

  revalidatePath("/floor");
  revalidatePath("/checkout");

  return { success: true as const };
}

export async function removeOrVoidOrderItem(input: unknown) {
  const parsed = removeItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid remove payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "waiter", "super_admin"]);

  const supabase = await createClient();
  const { orderItemId, reason } = parsed.data;

  const { data: item } = await supabase
    .from("order_items")
    .select("id, status, order_id")
    .eq("id", orderItemId)
    .eq("restaurant_id", context.restaurantId)
    .single();

  if (!item) {
    return { success: false as const, error: "Item not found" };
  }

  if (item.status === "draft") {
    const { error } = await supabase
      .from("order_items")
      .delete()
      .eq("id", orderItemId)
      .eq("restaurant_id", context.restaurantId);

    if (error) return { success: false as const, error: error.message };
  } else {
    const { error } = await supabase
      .from("order_items")
      .update({
        status: "voided",
        voided_at: new Date().toISOString(),
        void_reason: reason ?? "Voided",
        updated_by: context.userId
      })
      .eq("id", orderItemId)
      .eq("restaurant_id", context.restaurantId);

    if (error) return { success: false as const, error: error.message };
  }

  await syncOrderAndTableStatus(item.order_id, context.restaurantId!, context.userId);

  await supabase.from("audit_logs").insert({
    restaurant_id: context.restaurantId,
    actor_user_id: context.userId,
    action: "order_item_removed_or_voided",
    entity_type: "order_item",
    entity_id: orderItemId,
    metadata: { reason: reason ?? null }
  });

  revalidatePath("/floor");
  revalidatePath("/kitchen");

  return { success: true as const };
}

export async function closeOrderWithPayment(input: unknown) {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid checkout payload" };
  }

  const context = await getUserContextOrThrow();
  requireRoles(context, ["manager", "cashier", "waiter", "super_admin"]);

  const supabase = await createClient();
  const { orderId, paymentMethod, amountPaid, tipAmount, note } = parsed.data;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("id, total, floor_table_id")
    .eq("id", orderId)
    .eq("restaurant_id", context.restaurantId)
    .single();

  if (orderError || !order) {
    return { success: false as const, error: "Order not found" };
  }

  if (amountPaid + 0.0001 < Number(order.total)) {
    return { success: false as const, error: "Amount paid cannot be lower than total" };
  }

  const now = new Date().toISOString();

  const { error: paymentError } = await supabase.from("payments").insert({
    restaurant_id: context.restaurantId,
    order_id: order.id,
    amount: Number(order.total),
    tip_amount: tipAmount,
    payment_method: paymentMethod,
    paid_at: now,
    note: note ?? null,
    created_by: context.userId
  });

  if (paymentError) {
    return { success: false as const, error: paymentError.message };
  }

  const { error: closeError } = await supabase
    .from("orders")
    .update({
      status: "closed",
      closed_at: now,
      updated_by: context.userId,
      updated_at: now
    })
    .eq("id", order.id)
    .eq("restaurant_id", context.restaurantId);

  if (closeError) {
    return { success: false as const, error: closeError.message };
  }

  await supabase
    .from("floor_tables")
    .update({ status: "available", assigned_waiter_id: null })
    .eq("id", order.floor_table_id)
    .eq("restaurant_id", context.restaurantId);

  await supabase.from("audit_logs").insert({
    restaurant_id: context.restaurantId,
    actor_user_id: context.userId,
    action: "order_closed",
    entity_type: "order",
    entity_id: order.id,
    metadata: { payment_method: paymentMethod, amount_paid: amountPaid }
  });

  revalidatePath("/checkout");
  revalidatePath("/floor");
  revalidatePath("/reports");

  return { success: true as const };
}
