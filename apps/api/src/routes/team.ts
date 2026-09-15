import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createTeamMemberSchema, updateTeamMemberSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { teamMembers } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const teamRoute = new Hono<{ Variables: AppVariables }>();

teamRoute.use("*", authMiddleware);
teamRoute.use("*", requireRole("admin", "treinador"));

teamRoute.get("/", async (c) => {
  const rows = await db.select().from(teamMembers).orderBy(teamMembers.name);
  return c.json(rows);
});

teamRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [member] = await db.select().from(teamMembers).where(eq(teamMembers.id, id)).limit(1);
  if (!member) {
    return c.json({ error: "Membro não encontrado" }, 404);
  }
  return c.json(member);
});

teamRoute.post("/", requireRole("admin"), zValidator("json", createTeamMemberSchema), async (c) => {
  const input = c.req.valid("json");
  const [member] = await db.insert(teamMembers).values(input).returning();
  return c.json(member, 201);
});

teamRoute.put("/:id", requireRole("admin"), zValidator("json", updateTeamMemberSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");
  const [member] = await db.update(teamMembers).set(input).where(eq(teamMembers.id, id)).returning();
  if (!member) {
    return c.json({ error: "Membro não encontrado" }, 404);
  }
  return c.json(member);
});

export default teamRoute;
