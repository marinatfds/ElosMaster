import { z } from "zod";
import { CAMPUSES } from "../roles.js";

export const createTeamPositionSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(100, "Nome muito longo"),
});

export type CreateTeamPositionInput = z.infer<typeof createTeamPositionSchema>;

export const updateTeamPositionSchema = createTeamPositionSchema;

export type UpdateTeamPositionInput = z.infer<typeof updateTeamPositionSchema>;

export const teamPositionSchema = createTeamPositionSchema.extend({
  id: z.number().int(),
  memberCount: z.number().int(),
});

export type TeamPosition = z.infer<typeof teamPositionSchema>;

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  campus: z.enum(CAMPUSES),
  position: z.string().min(1, "Cargo obrigatório"),
  email: z.email(),
  phone: z.string().min(1, "Telefone obrigatório"),
});

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>;

export const teamMemberSchema = createTeamMemberSchema.extend({
  id: z.number().int(),
});

export type TeamMember = z.infer<typeof teamMemberSchema>;

export const updateTeamMemberSchema = createTeamMemberSchema;

export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>;
