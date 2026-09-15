import { z } from "zod";

export const DRIVE_SECTIONS = ["fgv", "puc", "anual"] as const;

export type DriveSection = (typeof DRIVE_SECTIONS)[number];

export const driveFileSchema = z.object({
  id: z.string(),
  name: z.string(),
  mimeType: z.string(),
  webViewLink: z.string().nullable(),
  modifiedTime: z.iso.datetime().nullable(),
});

export type DriveFile = z.infer<typeof driveFileSchema>;
