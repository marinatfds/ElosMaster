import { z } from "zod";
import { campusNameSchema } from "./campuses.js";

export const createStudentSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  campus: campusNameSchema,
  active: z.boolean(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const studentSchema = createStudentSchema.extend({
  id: z.number().int(),
  createdAt: z.iso.datetime(),
});

export type Student = z.infer<typeof studentSchema>;

export const updateStudentSchema = createStudentSchema;

export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
