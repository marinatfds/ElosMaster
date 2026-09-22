import type { Alert, CreateAlertInput, UpdateAlertInput } from "@elosmaster/shared";
import { api } from "./client";

export async function listAlerts() {
  const { data } = await api.get<Alert[]>("/alerts");
  return data;
}

export async function createAlert(input: CreateAlertInput) {
  const { data } = await api.post<Alert>("/alerts", input);
  return data;
}

export async function updateAlert(id: number, input: UpdateAlertInput) {
  const { data } = await api.put<Alert>(`/alerts/${id}`, input);
  return data;
}

export async function deleteAlert(id: number) {
  await api.delete(`/alerts/${id}`);
}
