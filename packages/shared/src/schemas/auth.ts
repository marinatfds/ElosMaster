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

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.email(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Senha atual obrigatória"),
    newPassword: z.string().min(8, "A nova senha deve ter pelo menos 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirmação obrigatória"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
