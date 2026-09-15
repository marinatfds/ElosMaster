import { z } from "zod";

export const createExamSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  examDate: z.iso.date(),
});

export type CreateExamInput = z.infer<typeof createExamSchema>;

export const examSchema = createExamSchema.extend({
  id: z.number().int(),
});

export type Exam = z.infer<typeof examSchema>;

export const setExamGradeSchema = z.object({
  examId: z.number().int(),
  studentId: z.number().int(),
  grade: z.number().min(0).max(10),
});

export type SetExamGradeInput = z.infer<typeof setExamGradeSchema>;

export const examGradeSchema = setExamGradeSchema.extend({
  id: z.number().int(),
});

export type ExamGrade = z.infer<typeof examGradeSchema>;

export const bulkSetExamGradesSchema = z.object({
  grades: z.array(z.object({ studentId: z.number().int(), grade: z.number().min(0).max(10) })),
});

export type BulkSetExamGradesInput = z.infer<typeof bulkSetExamGradesSchema>;

export const examGradeWithStudentSchema = z.object({
  studentId: z.number().int(),
  studentName: z.string(),
  grade: z.number().nullable(),
});

export type ExamGradeWithStudent = z.infer<typeof examGradeWithStudentSchema>;

export const examGradeWithExamSchema = z.object({
  examId: z.number().int(),
  examName: z.string(),
  examDate: z.iso.date(),
  grade: z.number(),
});

export type ExamGradeWithExam = z.infer<typeof examGradeWithExamSchema>;
