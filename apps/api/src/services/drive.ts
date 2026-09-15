import fs from "node:fs";
import { google } from "googleapis";
import type { DriveFile, DriveSection } from "@elosmaster/shared";

const SCOPES = ["https://www.googleapis.com/auth/drive.readonly"];

const SECTION_FOLDER_NAMES: Record<DriveSection, string> = { fgv: "FGV", puc: "PUC", anual: "Anual" };

export class DriveNotConfiguredError extends Error {
  constructor() {
    super("Google Drive não configurado (defina GOOGLE_SERVICE_ACCOUNT_KEY_PATH e GOOGLE_DRIVE_FOLDER_ID)");
  }
}

function getDriveClient() {
  const keyFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH;
  if (!keyFile || !fs.existsSync(keyFile)) {
    throw new DriveNotConfiguredError();
  }
  const auth = new google.auth.GoogleAuth({ keyFile, scopes: SCOPES });
  return google.drive({ version: "v3", auth });
}

async function resolveSectionFolderId(drive: ReturnType<typeof getDriveClient>, rootFolderId: string, section: DriveSection) {
  const res = await drive.files.list({
    q: `'${rootFolderId}' in parents and name = '${SECTION_FOLDER_NAMES[section]}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: "files(id)",
  });
  return res.data.files?.[0]?.id ?? rootFolderId;
}

export async function listSectionFiles(section: DriveSection): Promise<DriveFile[]> {
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  if (!rootFolderId) {
    throw new DriveNotConfiguredError();
  }

  const drive = getDriveClient();
  const folderId = await resolveSectionFolderId(drive, rootFolderId, section);

  const res = await drive.files.list({
    q: `'${folderId}' in parents and trashed = false`,
    fields: "files(id, name, mimeType, webViewLink, modifiedTime)",
    orderBy: "name",
  });

  return (res.data.files ?? []).map((f) => ({
    id: f.id!,
    name: f.name!,
    mimeType: f.mimeType!,
    webViewLink: f.webViewLink ?? null,
    modifiedTime: f.modifiedTime ?? null,
  }));
}
