import { z } from "zod";

export const restaurantSettingsSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(2).max(120),
  currencyCode: z.string().length(3),
  taxPercent: z.number().min(0).max(50),
  serviceChargePercent: z.number().min(0).max(40),
  allowWaiterCloseTable: z.boolean().default(false),
  language: z.enum(["en", "es"]).default("en")
});

export const staffRoleSchema = z.object({
  userId: z.string().uuid(),
  restaurantId: z.string().uuid(),
  role: z.enum(["manager", "waiter", "kitchen", "cashier", "super_admin"]),
  active: z.boolean()
});
