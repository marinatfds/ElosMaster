import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { count, eq } from "drizzle-orm";
import { createCampusSchema, updateCampusSchema, type CampusInfo } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { campuses, schedules, students, teamMembers } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { isForeignKeyViolation } from "../services/campuses.js";
import type { AppVariables } from "../types.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

const IN_USE_MESSAGE =
  "Não é possível excluir um núcleo que possui alunos, membros da equipe ou horários atribuídos";

async function countUsage(tx: Tx, name: string) {
  const [[{ studentCount }], [{ memberCount }], [{ scheduleCount }]] = await Promise.all([
    tx.select({ studentCount: count() }).from(students).where(eq(students.campus, name)),
    tx.select({ memberCount: count() }).from(teamMembers).where(eq(teamMembers.campus, name)),
    tx.select({ scheduleCount: count() }).from(schedules).where(eq(schedules.campus, name)),
  ]);
  return { studentCount, memberCount, scheduleCount };
}

const campusesRoute = new Hono<{ Variables: AppVariables }>();

campusesRoute.use("*", authMiddleware);

// A lista de núcleos alimenta seletores de todo o sistema (inclusive o calendário dos voluntários).
campusesRoute.get("/", async (c) => {
  const [campusRows, studentRows, memberRows, scheduleRows] = await Promise.all([
    db.select().from(campuses).orderBy(campuses.name),
    db.select({ campus: students.campus, total: count() }).from(students).groupBy(students.campus),
    db.select({ campus: teamMembers.campus, total: count() }).from(teamMembers).groupBy(teamMembers.campus),
    db.select({ campus: schedules.campus, total: count() }).from(schedules).groupBy(schedules.campus),
  ]);

  const totals = (rows: { campus: string; total: number }[]) => new Map(rows.map((r) => [r.campus, r.total]));
  const studentTotals = totals(studentRows);
  const memberTotals = totals(memberRows);
  const scheduleTotals = totals(scheduleRows);

  const result: CampusInfo[] = campusRows.map((campus) => ({
    ...campus,
    studentCount: studentTotals.get(campus.name) ?? 0,
    memberCount: memberTotals.get(campus.name) ?? 0,
    scheduleCount: scheduleTotals.get(campus.name) ?? 0,
  }));
  return c.json(result);
});

campusesRoute.post("/", requireRole("admin"), zValidator("json", createCampusSchema), async (c) => {
  const input = c.req.valid("json");
  const [campus] = await db.insert(campuses).values(input).onConflictDoNothing().returning();
  if (!campus) {
    return c.json({ error: "Já existe um núcleo com esse nome" }, 409);
  }
  const result: CampusInfo = { ...campus, studentCount: 0, memberCount: 0, scheduleCount: 0 };
  return c.json(result, 201);
});

campusesRoute.put("/:id", requireRole("admin"), zValidator("json", updateCampusSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");

  const result = await db.transaction(async (tx) => {
    const [current] = await tx.select().from(campuses).where(eq(campuses.id, id)).for("update").limit(1);
    if (!current) return "not-found" as const;

    if (current.name !== input.name) {
      const [duplicate] = await tx
        .select({ id: campuses.id })
        .from(campuses)
        .where(eq(campuses.name, input.name))
        .limit(1);
      if (duplicate) return "duplicate" as const;

      // Alunos, equipe e horários acompanham a renomeação via ON UPDATE CASCADE.
      await tx.update(campuses).set(input).where(eq(campuses.id, id));
    }

    return { id, name: input.name, ...(await countUsage(tx, input.name)) } satisfies CampusInfo;
  });

  if (result === "not-found") {
    return c.json({ error: "Núcleo não encontrado" }, 404);
  }
  if (result === "duplicate") {
    return c.json({ error: "Já existe um núcleo com esse nome" }, 409);
  }
  return c.json(result);
});

campusesRoute.delete("/:id", requireRole("admin"), async (c) => {
  const id = Number(c.req.param("id"));

  try {
    const result = await db.transaction(async (tx) => {
      const [current] = await tx.select().from(campuses).where(eq(campuses.id, id)).for("update").limit(1);
      if (!current) return "not-found" as const;

      const { studentCount, memberCount, scheduleCount } = await countUsage(tx, current.name);
      if (studentCount + memberCount + scheduleCount > 0) return "in-use" as const;

      await tx.delete(campuses).where(eq(campuses.id, id));
      return "deleted" as const;
    });

    if (result === "not-found") {
      return c.json({ error: "Núcleo não encontrado" }, 404);
    }
    if (result === "in-use") {
      return c.json({ error: IN_USE_MESSAGE }, 409);
    }
    return c.body(null, 204);
  } catch (err) {
    // Alguém atribuiu o núcleo entre a contagem e a exclusão: a FK (RESTRICT) barrou.
    if (isForeignKeyViolation(err)) {
      return c.json({ error: IN_USE_MESSAGE }, 409);
    }
    throw err;
  }
});

export default campusesRoute;
