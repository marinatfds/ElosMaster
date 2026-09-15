import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { createStudentSchema, type ExamGradeWithExam } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { students, examGrades, exams, presenceRecords } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { canAccessStudent, requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const studentsRoute = new Hono<{ Variables: AppVariables }>();

studentsRoute.use("*", authMiddleware);

studentsRoute.get("/", requireRole("admin", "treinador"), async (c) => {
  const rows = await db.select().from(students).orderBy(students.name);
  return c.json(rows);
});

studentsRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");

  if (!canAccessStudent(user, id)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!student) {
    return c.json({ error: "Aluno não encontrado" }, 404);
  }
  return c.json(student);
});

studentsRoute.get("/:id/grades", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");

  if (!canAccessStudent(user, id)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const rows = await db
    .select({
      examId: exams.id,
      examName: exams.name,
      examDate: exams.examDate,
      grade: examGrades.grade,
    })
    .from(examGrades)
    .innerJoin(exams, eq(exams.id, examGrades.examId))
    .where(eq(examGrades.studentId, id))
    .orderBy(desc(exams.examDate));

  const result: ExamGradeWithExam[] = rows;
  return c.json(result);
});

studentsRoute.get("/:id/presence", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");

  if (!canAccessStudent(user, id)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const rows = await db
    .select()
    .from(presenceRecords)
    .where(eq(presenceRecords.studentId, id))
    .orderBy(desc(presenceRecords.classDate));

  return c.json(rows);
});

studentsRoute.post("/", requireRole("admin", "treinador"), zValidator("json", createStudentSchema), async (c) => {
  const input = c.req.valid("json");
  const [student] = await db.insert(students).values(input).returning();
  return c.json(student, 201);
});

export default studentsRoute;
