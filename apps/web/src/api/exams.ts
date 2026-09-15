import type {
  BulkSetExamGradesInput,
  CreateExamInput,
  Exam,
  ExamGrade,
  ExamGradeWithExam,
  ExamGradeWithStudent,
} from "@elosmaster/shared";
import { api } from "./client";

export async function listExams() {
  const { data } = await api.get<Exam[]>("/exams");
  return data;
}

export async function createExam(input: CreateExamInput) {
  const { data } = await api.post<Exam>("/exams", input);
  return data;
}

export async function getExamGrades(examId: number) {
  const { data } = await api.get<ExamGradeWithStudent[]>(`/exams/${examId}/grades`);
  return data;
}

export async function saveExamGrades(examId: number, input: BulkSetExamGradesInput) {
  const { data } = await api.post<ExamGrade[]>(`/exams/${examId}/grades`, input);
  return data;
}

export async function getStudentGrades(studentId: number) {
  const { data } = await api.get<ExamGradeWithExam[]>(`/students/${studentId}/grades`);
  return data;
}
