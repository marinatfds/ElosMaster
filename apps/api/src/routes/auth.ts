import { Hono, type Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { setCookie, deleteCookie } from "hono/cookie";
import bcrypt from "bcryptjs";
import {
  changePasswordSchema,
  loginSchema,
  updateProfileSchema,
  type CurrentUser,
} from "@elosmaster/shared";
import { db } from "../db/client.js";
import { users } from "../db/schema.js";
import { AUTH_COOKIE, authMiddleware } from "../middleware/auth.js";
import type { AppVariables } from "../types.js";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error("JWT_SECRET não definida");
  })();

const SESSION_HOURS = 8;

const auth = new Hono<{ Variables: AppVariables }>();

async function issueSession(c: Context<{ Variables: AppVariables }>, currentUser: CurrentUser) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_HOURS * 60 * 60;
  const token = await sign({ ...currentUser, exp }, JWT_SECRET);

  setCookie(c, AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

auth.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return c.json({ error: "Credenciais inválidas" }, 401);
  }

  const currentUser: CurrentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    studentId: user.studentId,
  };

  await issueSession(c, currentUser);

  return c.json(currentUser);
});

auth.get("/me", authMiddleware, (c) => {
  return c.json(c.get("user"));
});

auth.put("/me", authMiddleware, zValidator("json", updateProfileSchema), async (c) => {
  const sessionUser = c.get("user");
  const { name, email } = c.req.valid("json");

  const [emailOwner] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (emailOwner && emailOwner.id !== sessionUser.id) {
    return c.json({ error: "E-mail já está em uso" }, 409);
  }

  const [updated] = await db
    .update(users)
    .set({ name, email })
    .where(eq(users.id, sessionUser.id))
    .returning();
  if (!updated) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }

  const currentUser: CurrentUser = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    studentId: updated.studentId,
  };

  await issueSession(c, currentUser);

  return c.json(currentUser);
});

auth.put("/me/password", authMiddleware, zValidator("json", changePasswordSchema), async (c) => {
  const sessionUser = c.get("user");
  const { currentPassword, newPassword } = c.req.valid("json");

  const [dbUser] = await db.select().from(users).where(eq(users.id, sessionUser.id)).limit(1);
  if (!dbUser) {
    return c.json({ error: "Usuário não encontrado" }, 404);
  }

  const passwordMatches = await bcrypt.compare(currentPassword, dbUser.passwordHash);
  if (!passwordMatches) {
    return c.json({ error: "Senha atual incorreta" }, 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.update(users).set({ passwordHash }).where(eq(users.id, sessionUser.id));

  return c.body(null, 204);
});

auth.post("/logout", (c) => {
  deleteCookie(c, AUTH_COOKIE, { path: "/" });
  return c.body(null, 204);
});

export default auth;
