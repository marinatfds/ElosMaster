import type { TeamMember, CreateTeamMemberInput, UpdateTeamMemberInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listTeamMembers() {
  const { data } = await api.get<TeamMember[]>("/team");
  return data;
}

export async function getTeamMember(id: number) {
  const { data } = await api.get<TeamMember>(`/team/${id}`);
  return data;
}

export async function createTeamMember(input: CreateTeamMemberInput) {
  const { data } = await api.post<TeamMember>("/team", input);
  return data;
}

export async function updateTeamMember(id: number, input: UpdateTeamMemberInput) {
  const { data } = await api.put<TeamMember>(`/team/${id}`, input);
  return data;
}
