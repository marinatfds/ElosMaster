import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createTeamMemberSchema, updateTeamMemberSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { teamMembers, teamPositions } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const UNKNOWN_POSITION = "unknown-position" as const;

// Trava o cargo para que ele não seja excluído enquanto o membro é gravado.
async function lockPosition(tx: Tx, name: string) {
  const [position] = await tx
    .select({ id: teamPositions.id })
    .from(teamPositions)
    .where(eq(teamPositions.name, name))
    .for("share")
    .limit(1);
  return !!position;
}

const teamRoute = new Hono<{ Variables: AppVariables }>();

teamRoute.use("*", authMiddleware);
teamRoute.use("*", requireRole("admin", "coordinator"));

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
  const member = await db.transaction(async (tx) => {
    if (!(await lockPosition(tx, input.position))) return UNKNOWN_POSITION;
    const [created] = await tx.insert(teamMembers).values(input).returning();
    return created;
  });
  if (member === UNKNOWN_POSITION) {
    return c.json({ error: "Cargo inexistente" }, 400);
  }
  return c.json(member, 201);
});

teamRoute.put("/:id", requireRole("admin"), zValidator("json", updateTeamMemberSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");
  const member = await db.transaction(async (tx) => {
    if (!(await lockPosition(tx, input.position))) return UNKNOWN_POSITION;
    const [updated] = await tx.update(teamMembers).set(input).where(eq(teamMembers.id, id)).returning();
    return updated;
  });
  if (member === UNKNOWN_POSITION) {
    return c.json({ error: "Cargo inexistente" }, 400);
  }
  if (!member) {
    return c.json({ error: "Membro não encontrado" }, 404);
  }
  return c.json(member);
});

export default teamRoute;
