import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { createStudentSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { students } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
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

  if (user.role === "aluno_responsavel" && user.studentId !== id) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const [student] = await db.select().from(students).where(eq(students.id, id)).limit(1);
  if (!student) {
    return c.json({ error: "Aluno não encontrado" }, 404);
  }
  return c.json(student);
});

studentsRoute.post("/", requireRole("admin", "treinador"), zValidator("json", createStudentSchema), async (c) => {
  const input = c.req.valid("json");
  const [student] = await db.insert(students).values(input).returning();
  return c.json(student, 201);
});

export default studentsRoute;
