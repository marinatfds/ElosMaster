import type { Student, CreateStudentInput, UpdateStudentInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listStudents() {
  const { data } = await api.get<Student[]>("/students");
  return data;
}

export async function getStudent(id: number) {
  const { data } = await api.get<Student>(`/students/${id}`);
  return data;
}

export async function createStudent(input: CreateStudentInput) {
  const { data } = await api.post<Student>("/students", input);
  return data;
}

export async function updateStudent(id: number, input: UpdateStudentInput) {
  const { data } = await api.put<Student>(`/students/${id}`, input);
  return data;
}
