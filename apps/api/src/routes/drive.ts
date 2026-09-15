import { Hono } from "hono";
import { DRIVE_SECTIONS, type DriveSection } from "@elosmaster/shared";
import { authMiddleware } from "../middleware/auth.js";
import { DriveNotConfiguredError, listSectionFiles } from "../services/drive.js";
import type { AppVariables } from "../types.js";

const driveRoute = new Hono<{ Variables: AppVariables }>();

driveRoute.use("*", authMiddleware);

driveRoute.get("/files", async (c) => {
  const section = c.req.query("section");
  if (!section || !DRIVE_SECTIONS.includes(section as DriveSection)) {
    return c.json({ error: "Parâmetro 'section' inválido" }, 400);
  }

  try {
    const files = await listSectionFiles(section as DriveSection);
    return c.json(files);
  } catch (err) {
    if (err instanceof DriveNotConfiguredError) {
      return c.json({ error: err.message }, 503);
    }
    console.error(err);
    return c.json({ error: "Não foi possível acessar o Google Drive" }, 502);
  }
});

export default driveRoute;
