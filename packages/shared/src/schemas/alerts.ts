import { z } from "zod";

export const createAlertSchema = z.object({
  message: z.string().min(1, "Mensagem obrigatória").max(2000),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export const alertSchema = createAlertSchema.extend({
  id: z.number().int(),
  createdBy: z.number().int(),
  createdAt: z.iso.datetime(),
});

export type Alert = z.infer<typeof alertSchema>;

export const updateAlertSchema = createAlertSchema;

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
