import type { Notification } from "@elosmaster/shared";
import { api } from "./client";

export async function listNotifications() {
  const { data } = await api.get<Notification[]>("/notifications");
  return data;
}

export async function markNotificationRead(id: number) {
  const { data } = await api.patch<Notification>(`/notifications/${id}/read`);
  return data;
}
