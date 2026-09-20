import type { CampusInfo, CreateCampusInput, UpdateCampusInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listCampuses() {
  const { data } = await api.get<CampusInfo[]>("/campuses");
  return data;
}

export async function createCampus(input: CreateCampusInput) {
  const { data } = await api.post<CampusInfo>("/campuses", input);
  return data;
}

export async function updateCampus(id: number, input: UpdateCampusInput) {
  const { data } = await api.put<CampusInfo>(`/campuses/${id}`, input);
  return data;
}

export async function deleteCampus(id: number) {
  await api.delete(`/campuses/${id}`);
}
