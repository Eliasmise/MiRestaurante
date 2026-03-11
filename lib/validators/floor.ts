import { z } from "zod";

export const floorTableSchema = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  floor_id: z.string().uuid(),
  section_id: z.string().uuid().nullable().optional(),
  table_code: z.string().min(1).max(20),
  display_name: z.string().min(1).max(50),
  shape: z.enum(["circle", "square", "rectangle"]),
  pos_x: z.number().min(0).max(2000),
  pos_y: z.number().min(0).max(2000),
  width: z.number().min(60).max(320),
  height: z.number().min(60).max(320),
  seats: z.number().int().min(1).max(20),
  is_active: z.boolean().default(true)
});

export const floorLayoutSchema = z.object({
  floorId: z.string().uuid(),
  tables: z.array(floorTableSchema)
});

export const waiterAssignmentSchema = z.object({
  tableId: z.string().uuid(),
  waiterId: z.string().uuid().nullable()
});
