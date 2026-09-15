import { Hono } from "hono";
import { desc, eq } from "drizzle-orm";
import type { ExamGradeWithExam } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { charges, exams, examGrades, presenceRecords, students } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { canAccessStudent, requireRole } from "../middleware/rbac.js";
import { renderPdf } from "../services/pdf.js";
import { boletimHtml, financeiroHtml } from "../services/report-templates.js";
import type { AppVariables } from "../types.js";

const reportsRoute = new Hono<{ Variables: AppVariables }>();

reportsRoute.use("*", authMiddleware);

function pdfResponse(pdf: Buffer, filename: string) {
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

reportsRoute.get("/boletim/:studentId", async (c) => {
  const studentId = Number(c.req.param("studentId"));
  const user = c.get("user");

  if (!canAccessStudent(user, studentId)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
  if (!student) {
    return c.json({ error: "Aluno não encontrado" }, 404);
  }

  const gradeRows = await db
    .select({
      examId: exams.id,
      examName: exams.name,
      examDate: exams.examDate,
      grade: examGrades.grade,
    })
    .from(examGrades)
    .innerJoin(exams, eq(exams.id, examGrades.examId))
    .where(eq(examGrades.studentId, studentId))
    .orderBy(desc(exams.examDate));
  const grades: ExamGradeWithExam[] = gradeRows;

  const presence = await db
    .select()
    .from(presenceRecords)
    .where(eq(presenceRecords.studentId, studentId))
    .orderBy(desc(presenceRecords.classDate));

  const pdf = await renderPdf(boletimHtml(student, grades, presence));
  return pdfResponse(pdf, `boletim-${student.id}.pdf`);
});

reportsRoute.get("/financeiro", requireRole("admin", "treinador"), async (c) => {
  const rows = await db.select().from(charges).orderBy(desc(charges.paymentDate));
  const pdf = await renderPdf(financeiroHtml(rows));
  return pdfResponse(pdf, "extrato-financeiro.pdf");
});

export default reportsRoute;
