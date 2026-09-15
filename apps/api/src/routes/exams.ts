import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq, sql } from "drizzle-orm";
import { createExamSchema, bulkSetExamGradesSchema, type ExamGradeWithStudent } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { exams, examGrades, students } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { notifyGuardians } from "../services/notification-bus.js";
import type { AppVariables } from "../types.js";

const examsRoute = new Hono<{ Variables: AppVariables }>();

examsRoute.use("*", authMiddleware);
examsRoute.use("*", requireRole("admin", "treinador"));

examsRoute.get("/", async (c) => {
  const rows = await db.select().from(exams).orderBy(exams.examDate);
  return c.json(rows);
});

examsRoute.post("/", zValidator("json", createExamSchema), async (c) => {
  const input = c.req.valid("json");
  const [exam] = await db.insert(exams).values(input).returning();
  return c.json(exam, 201);
});

examsRoute.get("/:id/grades", async (c) => {
  const examId = Number(c.req.param("id"));

  const rows = await db
    .select({
      studentId: students.id,
      studentName: students.name,
      grade: examGrades.grade,
    })
    .from(students)
    .leftJoin(examGrades, and(eq(examGrades.studentId, students.id), eq(examGrades.examId, examId)))
    .where(eq(students.active, true))
    .orderBy(students.name);

  const result: ExamGradeWithStudent[] = rows.map((row) => ({
    studentId: row.studentId,
    studentName: row.studentName,
    grade: row.grade,
  }));

  return c.json(result);
});

examsRoute.post("/:id/grades", zValidator("json", bulkSetExamGradesSchema), async (c) => {
  const examId = Number(c.req.param("id"));
  const { grades } = c.req.valid("json");

  if (grades.length === 0) {
    return c.json([]);
  }

  const [exam] = await db.select().from(exams).where(eq(exams.id, examId)).limit(1);
  if (!exam) {
    return c.json({ error: "Simulado não encontrado" }, 404);
  }

  const saved = await db
    .insert(examGrades)
    .values(grades.map((g) => ({ examId, studentId: g.studentId, grade: g.grade })))
    .onConflictDoUpdate({
      target: [examGrades.examId, examGrades.studentId],
      set: { grade: sql`excluded.grade` },
    })
    .returning();

  for (const grade of saved) {
    await notifyGuardians(grade.studentId, "grade_posted", `Nova nota em ${exam.name}: ${grade.grade}`);
  }

  return c.json(saved, 201);
});

export default examsRoute;
