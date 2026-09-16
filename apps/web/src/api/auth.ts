import type { ChangePasswordInput, CurrentUser, UpdateProfileInput } from "@elosmaster/shared";
import { api } from "./client";

export async function updateProfile(input: UpdateProfileInput) {
  const { data } = await api.put<CurrentUser>("/auth/me", input);
  return data;
}

export async function changePassword(input: ChangePasswordInput) {
  await api.put("/auth/me/password", input);
}
