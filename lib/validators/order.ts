import { z } from "zod";

export const modifierSelectionSchema = z.object({
  modifier_option_id: z.string().uuid(),
  name: z.string().min(1),
  price_delta: z.number().min(-1000).max(1000)
});

export const addItemSchema = z.object({
  tableId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
  note: z.string().max(500).optional().nullable(),
  modifiers: z.array(modifierSelectionSchema).default([])
});

export const sendToKitchenSchema = z.object({
  orderId: z.string().uuid(),
  itemIds: z.array(z.string().uuid()).optional()
});

export const kitchenStatusSchema = z.object({
  orderItemId: z.string().uuid(),
  status: z.enum(["submitted", "preparing", "ready", "served"])
});

export const updateItemQuantitySchema = z.object({
  orderItemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20)
});

export const removeItemSchema = z.object({
  orderItemId: z.string().uuid(),
  reason: z.string().max(200).optional()
});

export const checkoutSchema = z.object({
  orderId: z.string().uuid(),
  paymentMethod: z.enum(["cash", "card", "transfer", "other"]),
  amountPaid: z.number().positive(),
  tipAmount: z.number().min(0).default(0),
  note: z.string().max(300).optional().nullable()
});
