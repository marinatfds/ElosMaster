import { z } from "zod";
import { CAMPUSES } from "../roles.js";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  campus: z.enum(CAMPUSES),
  active: z.boolean(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const studentSchema = createStudentSchema.extend({
  id: z.number().int(),
  createdAt: z.iso.datetime(),
});

export type Student = z.infer<typeof studentSchema>;
