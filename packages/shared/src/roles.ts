export const ROLES = ["admin", "coordinator", "volunteer"] as const;

export type Role = (typeof ROLES)[number];
