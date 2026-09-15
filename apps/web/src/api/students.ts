import type { Student, CreateStudentInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listStudents() {
  const { data } = await api.get<Student[]>("/students");
  return data;
}

export async function createStudent(input: CreateStudentInput) {
  const { data } = await api.post<Student>("/students", input);
  return data;
}
