import type { BulkPresenceInput, Campus, PresenceRecord, RosterPresence } from "@elosmaster/shared";
import { api } from "./client";

export async function getPresenceRoster(campus: Campus, classDate: string, period: "morning" | "afternoon") {
  const { data } = await api.get<RosterPresence[]>("/presence/roster", {
    params: { campus, classDate, period },
  });
  return data;
}

export async function savePresence(input: BulkPresenceInput) {
  const { data } = await api.post<PresenceRecord[]>("/presence", input);
  return data;
}

export async function getStudentPresence(studentId: number) {
  const { data } = await api.get<PresenceRecord[]>(`/students/${studentId}/presence`);
  return data;
}
