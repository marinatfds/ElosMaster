import { z } from "zod";
import { CAMPUSES } from "../roles.js";

export const TEAM_POSITIONS = [
  "Monitor(a) de Matemática",
  "Coordenador(a) de Monitoria",
  "Professor(a) de Roda",
  "Professor(a) de Escrita",
  "Professor(a) de Leitura",
  "Professor(a) de PCS",
  "Professor(a) de Álgebra",
  "Professor(a) de Geometria",
  "Professor(a) de Aritmética",
  "Coordenador(a)",
  "Assistente de Coordenação",
] as const;

export const createTeamMemberSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  campus: z.enum(CAMPUSES),
  position: z.enum(TEAM_POSITIONS),
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
