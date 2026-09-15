import type { DriveFile, DriveSection } from "@elosmaster/shared";
import { api } from "./client";

export async function listDriveFiles(section: DriveSection) {
  const { data } = await api.get<DriveFile[]>("/drive/files", { params: { section } });
  return data;
}
