import { z } from "zod";

export const createCampusSchema = z.object({
  name: z.string().trim().min(1, "Nome obrigatório").max(100, "Nome muito longo"),
});

export type CreateCampusInput = z.infer<typeof createCampusSchema>;

export const updateCampusSchema = createCampusSchema;

export type UpdateCampusInput = z.infer<typeof updateCampusSchema>;

export const campusSchema = createCampusSchema.extend({
  id: z.number().int(),
  studentCount: z.number().int(),
  memberCount: z.number().int(),
  scheduleCount: z.number().int(),
});

export type CampusInfo = z.infer<typeof campusSchema>;

/** Nome de um campus cadastrado (o nome é a chave de referência usada por alunos, equipe e horários). */
export const campusNameSchema = z.string().trim().min(1, "Núcleo obrigatório");

export type Campus = z.infer<typeof campusNameSchema>;
