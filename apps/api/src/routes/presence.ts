import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import {
  bulkPresenceSchema,
  CAMPUSES,
  PERIODS,
  type RosterPresence,
} from "@elosmaster/shared";
import { db } from "../db/client.js";
import { presenceRecords, students } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const presenceRoute = new Hono<{ Variables: AppVariables }>();

presenceRoute.use("*", authMiddleware);
presenceRoute.use("*", requireRole("admin", "treinador"));

presenceRoute.get("/roster", async (c) => {
  const campus = c.req.query("campus");
  const classDate = c.req.query("classDate");
  const period = c.req.query("period");

  if (!campus || !CAMPUSES.includes(campus as (typeof CAMPUSES)[number])) {
    return c.json({ error: "Parâmetro 'campus' inválido" }, 400);
  }
  if (!classDate) {
    return c.json({ error: "Parâmetro 'classDate' obrigatório" }, 400);
  }
  if (!period || !PERIODS.includes(period as (typeof PERIODS)[number])) {
    return c.json({ error: "Parâmetro 'period' inválido" }, 400);
  }

  const rows = await db
    .select({
      studentId: students.id,
      studentName: students.name,
      present: presenceRecords.present,
      comment: presenceRecords.comment,
    })
    .from(students)
    .leftJoin(
      presenceRecords,
      and(
        eq(presenceRecords.studentId, students.id),
        eq(presenceRecords.classDate, classDate),
        eq(presenceRecords.period, period as (typeof PERIODS)[number]),
      ),
    )
    .where(and(eq(students.campus, campus as (typeof CAMPUSES)[number]), eq(students.active, true)))
    .orderBy(students.name);

  const result: RosterPresence[] = rows.map((row) => ({
    studentId: row.studentId,
    studentName: row.studentName,
    present: row.present,
    comment: row.comment,
  }));

  return c.json(result);
});

presenceRoute.post("/", zValidator("json", bulkPresenceSchema), async (c) => {
  const { records } = c.req.valid("json");

  const saved = await db
    .insert(presenceRecords)
    .values(records)
    .onConflictDoUpdate({
      target: [presenceRecords.studentId, presenceRecords.classDate, presenceRecords.period],
      set: { present: sql`excluded.present`, comment: sql`excluded.comment` },
    })
    .returning();

  return c.json(saved, 201);
});

export default presenceRoute;
