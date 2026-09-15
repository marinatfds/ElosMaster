import type { Context, Next } from "hono";
import type { CurrentUser, Role } from "@elosmaster/shared";
import type { AppVariables } from "../types.js";

export function requireRole(...roles: Role[]) {
  return async (c: Context<{ Variables: AppVariables }>, next: Next) => {
    const user = c.get("user");
    if (!user || !roles.includes(user.role)) {
      return c.json({ error: "Acesso negado para este papel" }, 403);
    }
    await next();
  };
}

/** aluno_responsavel can only reach data for the student linked to their account. */
export function canAccessStudent(user: CurrentUser, studentId: number) {
  return user.role !== "aluno_responsavel" || user.studentId === studentId;
}
