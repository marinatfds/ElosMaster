import type {
  AnnualCalendarData,
  CalendarSettings,
  CreateExtraClassInput,
  ExtraClass,
  UpdateAulaWeekdaysInput,
  UpdateCalendarSettingsInput,
} from "@elosmaster/shared";
import { api } from "./client";

export async function getAnnualCalendar() {
  const { data } = await api.get<AnnualCalendarData>("/calendar");
  return data;
}

export async function updateCalendarSettings(input: UpdateCalendarSettingsInput) {
  const { data } = await api.put<CalendarSettings>("/calendar/settings", input);
  return data;
}

export async function updateAulaWeekdays(input: UpdateAulaWeekdaysInput) {
  const { data } = await api.put<CalendarSettings>("/calendar/settings/weekdays", input);
  return data;
}

export async function createExtraClass(input: CreateExtraClassInput) {
  const { data } = await api.post<ExtraClass>("/calendar/extra-classes", input);
  return data;
}

export async function deleteExtraClass(id: number) {
  await api.delete(`/calendar/extra-classes/${id}`);
}
