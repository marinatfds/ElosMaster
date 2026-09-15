import type { CreateScheduleInput, Schedule } from "@elosmaster/shared";
import { api } from "./client";

export async function listSchedules() {
  const { data } = await api.get<Schedule[]>("/schedules");
  return data;
}

export async function createSchedule(input: CreateScheduleInput) {
  const { data } = await api.post<Schedule>("/schedules", input);
  return data;
}
