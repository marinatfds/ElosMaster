import { getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import type { Context, Next } from "hono";
import type { CurrentUser } from "@elosmaster/shared";
import type { AppVariables } from "../types.js";

export const AUTH_COOKIE = "elos_token";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET não definida");
  })();

export async function authMiddleware(c: Context<{ Variables: AppVariables }>, next: Next) {
  const token = getCookie(c, AUTH_COOKIE);
  if (!token) {
    return c.json({ error: "Não autenticado" }, 401);
  }

  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    c.set("user", payload as unknown as CurrentUser);
  } catch {
    return c.json({ error: "Sessão inválida ou expirada" }, 401);
  }

  await next();
}
