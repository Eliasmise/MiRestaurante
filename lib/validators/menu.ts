import { z } from "zod";

export const menuCategorySchema = z.object({
  id: z.string().uuid().optional(),
  restaurantId: z.string().uuid(),
  name: z.string().min(2).max(80),
  slug: z.string().min(2).max(80),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean().default(true)
});

export const menuSubcategorySchema = z.object({
  id: z.string().uuid().optional(),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(80),
  sortOrder: z.number().int().min(0).max(9999),
  isActive: z.boolean().default(true)
});

export const menuItemSchema = z.object({
  id: z.string().uuid().optional(),
  restaurantId: z.string().uuid(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().nullable().optional(),
  name: z.string().min(2).max(120),
  description: z.string().max(500).nullable().optional(),
  price: z.number().positive(),
  prepStation: z.string().max(100).nullable().optional(),
  taxRate: z.number().min(0).max(1),
  sortOrder: z.number().int().min(0).max(9999),
  imageUrl: z.string().url().nullable().optional(),
  isActive: z.boolean().default(true)
});
