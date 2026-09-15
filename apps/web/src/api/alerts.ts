import type { Alert, CreateAlertInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listAlerts() {
  const { data } = await api.get<Alert[]>("/alerts");
  return data;
}

export async function createAlert(input: CreateAlertInput) {
  const { data } = await api.post<Alert>("/alerts", input);
  return data;
}
