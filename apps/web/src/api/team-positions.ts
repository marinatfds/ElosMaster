import type { TeamPosition, CreateTeamPositionInput, UpdateTeamPositionInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listTeamPositions() {
  const { data } = await api.get<TeamPosition[]>("/team-positions");
  return data;
}

export async function createTeamPosition(input: CreateTeamPositionInput) {
  const { data } = await api.post<TeamPosition>("/team-positions", input);
  return data;
}

export async function updateTeamPosition(id: number, input: UpdateTeamPositionInput) {
  const { data } = await api.put<TeamPosition>(`/team-positions/${id}`, input);
  return data;
}

export async function deleteTeamPosition(id: number) {
  await api.delete(`/team-positions/${id}`);
}
