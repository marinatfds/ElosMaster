import type { CreateScheduleInput, Schedule, UpdateScheduleInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listSchedules() {
  const { data } = await api.get<Schedule[]>("/schedules");
  return data;
}

export async function getSchedule(id: number) {
  const { data } = await api.get<Schedule>(`/schedules/${id}`);
  return data;
}

export async function createSchedule(input: CreateScheduleInput) {
  const { data } = await api.post<Schedule>("/schedules", input);
  return data;
}

export async function updateSchedule(id: number, input: UpdateScheduleInput) {
  const { data } = await api.put<Schedule>(`/schedules/${id}`, input);
  return data;
}
