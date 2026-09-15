import type { TeamMember, CreateTeamMemberInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listTeamMembers() {
  const { data } = await api.get<TeamMember[]>("/team");
  return data;
}

export async function createTeamMember(input: CreateTeamMemberInput) {
  const { data } = await api.post<TeamMember>("/team", input);
  return data;
}
