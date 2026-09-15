import { z } from "zod";
import { CAMPUSES } from "../roles.js";

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
