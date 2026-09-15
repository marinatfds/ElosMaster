import { z } from "zod";

export const EXPENSE_TYPES = [
  "Alimentação",
  "Atividades",
  "Impressão",
  "Saúde",
  "Outros",
] as const;

export const createChargeSchema = z.object({
  expenseType: z.enum(EXPENSE_TYPES),
  description: z.string().min(1, "Descrição obrigatória").max(1000),
  author: z.string().min(1, "Autor obrigatório"),
  value: z.number().positive("Valor deve ser maior que zero"),
  paymentDate: z.iso.date(),
});

export type CreateChargeInput = z.infer<typeof createChargeSchema>;

export const chargeSchema = createChargeSchema.extend({
  id: z.number().int(),
  inclusionDate: z.iso.datetime(),
});

export type Charge = z.infer<typeof chargeSchema>;

export const updateChargeSchema = createChargeSchema;

export type UpdateChargeInput = z.infer<typeof updateChargeSchema>;
