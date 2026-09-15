export const ROLES = ["admin", "treinador", "aluno_responsavel"] as const;

export type Role = (typeof ROLES)[number];

export const CAMPUSES = ["FGV", "PUC"] as const;

export type Campus = (typeof CAMPUSES)[number];
