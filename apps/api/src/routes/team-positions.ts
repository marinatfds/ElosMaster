import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { createTeamPositionSchema, updateTeamPositionSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { teamMembers, teamPositions } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const teamPositionsRoute = new Hono<{ Variables: AppVariables }>();

teamPositionsRoute.use("*", authMiddleware);
teamPositionsRoute.use("*", requireRole("admin", "coordinator"));

teamPositionsRoute.get("/", async (c) => {
  const rows = await db
    .select({ id: teamPositions.id, name: teamPositions.name, memberCount: count(teamMembers.id) })
    .from(teamPositions)
    .leftJoin(teamMembers, eq(teamMembers.position, teamPositions.name))
    .groupBy(teamPositions.id)
    .orderBy(teamPositions.name);
  return c.json(rows);
});

teamPositionsRoute.post("/", requireRole("admin"), zValidator("json", createTeamPositionSchema), async (c) => {
  const input = c.req.valid("json");
  const [position] = await db.insert(teamPositions).values(input).onConflictDoNothing().returning();
  if (!position) {
    return c.json({ error: "Já existe um cargo com esse nome" }, 409);
  }
  return c.json({ ...position, memberCount: 0 }, 201);
});

teamPositionsRoute.put("/:id", requireRole("admin"), zValidator("json", updateTeamPositionSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");

  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(teamPositions).where(eq(teamPositions.id, id)).for("update").limit(1);
    if (!current) return "not-found" as const;

    if (current.name !== input.name) {
      const [duplicate] = await tx
        .select({ id: teamPositions.id })
        .from(teamPositions)
        .where(eq(teamPositions.name, input.name))
        .limit(1);
      if (duplicate) return "duplicate" as const;

      await tx.update(teamPositions).set(input).where(eq(teamPositions.id, id));
      // Membros guardam o nome do cargo, então acompanham a renomeação.
      await tx.update(teamMembers).set({ position: input.name }).where(eq(teamMembers.position, current.name));
    }

    const [{ memberCount }] = await tx
      .select({ memberCount: count() })
      .from(teamMembers)
      .where(eq(teamMembers.position, input.name));
    return { id, name: input.name, memberCount };
  });

  if (result === "not-found") {
    return c.json({ error: "Cargo não encontrado" }, 404);
  }
  if (result === "duplicate") {
    return c.json({ error: "Já existe um cargo com esse nome" }, 409);
  }
  return c.json(result);
});

teamPositionsRoute.delete("/:id", requireRole("admin"), async (c) => {
  const id = Number(c.req.param("id"));

  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(teamPositions).where(eq(teamPositions.id, id)).for("update").limit(1);
    if (!current) return "not-found" as const;

    const [{ memberCount }] = await tx
      .select({ memberCount: count() })
      .from(teamMembers)
      .where(eq(teamMembers.position, current.name));
    if (memberCount > 0) return "in-use" as const;

    await tx.delete(teamPositions).where(eq(teamPositions.id, id));
    return "deleted" as const;
  });

  if (result === "not-found") {
    return c.json({ error: "Cargo não encontrado" }, 404);
  }
  if (result === "in-use") {
    return c.json({ error: "Não é possível excluir um cargo que possui membros da equipe atribuídos" }, 409);
  }
  return c.body(null, 204);
});

export default teamPositionsRoute;
