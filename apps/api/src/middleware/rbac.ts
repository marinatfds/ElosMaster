import type { Context, Next } from "hono";
import type { Role } from "@elosmaster/shared";
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
