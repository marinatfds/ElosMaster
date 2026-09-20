import { Hono } from "hono";
import { desc, eq, inArray, sql } from "drizzle-orm";
import type { ExamGradeWithExam } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { campuses, charges, exams, examGrades, presenceRecords, students } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { canAccessStudent, requireRole } from "../middleware/rbac.js";
import { renderPdf } from "../services/pdf.js";
import { boletimHtml, buildExamAverages, financeiroHtml } from "../services/report-templates.js";
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

  const examIds = [...new Set(grades.map((g) => g.examId))];
  const campusAvgRows = examIds.length
    ? await db
        .select({
          examId: examGrades.examId,
          campus: students.campus,
          avgGrade: sql<string>`avg(${examGrades.grade})`,
          count: sql<string>`count(*)`,
        })
        .from(examGrades)
        .innerJoin(students, eq(students.id, examGrades.studentId))
        .where(inArray(examGrades.examId, examIds))
        .groupBy(examGrades.examId, students.campus)
    : [];
  const examAverages = buildExamAverages(campusAvgRows);

  const presence = await db
    .select()
    .from(presenceRecords)
    .where(eq(presenceRecords.studentId, studentId))
    .orderBy(desc(presenceRecords.classDate));

  const campusNames = (await db.select({ name: campuses.name }).from(campuses).orderBy(campuses.name)).map(
    (campus) => campus.name,
  );

  const pdf = await renderPdf(boletimHtml(student, grades, examAverages, presence, campusNames));
  return pdfResponse(pdf, `boletim-${student.id}.pdf`);
});

reportsRoute.get("/financeiro", requireRole("admin", "coordinator"), async (c) => {
  const rows = await db.select().from(charges).orderBy(desc(charges.paymentDate));
  const pdf = await renderPdf(financeiroHtml(rows));
  return pdfResponse(pdf, "extrato-financeiro.pdf");
});

export default reportsRoute;
