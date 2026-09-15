import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createTeamMemberSchema } from "@elosmaster/shared";
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

teamRoute.post("/", requireRole("admin"), zValidator("json", createTeamMemberSchema), async (c) => {
  const input = c.req.valid("json");
  const [member] = await db.insert(teamMembers).values(input).returning();
  return c.json(member, 201);
});

export default teamRoute;
