import { z } from "zod";
import { ROLES } from "../roles.js";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Senha obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const currentUserSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.email(),
  role: z.enum(ROLES),
  studentId: z.number().int().nullable(),
});

export type CurrentUser = z.infer<typeof currentUserSchema>;
