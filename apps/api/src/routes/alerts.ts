import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { createAlertSchema, updateAlertSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { alerts } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { isAlertAuthor, requireRole } from "../middleware/rbac.js";
import { publishNotification } from "../services/notification-bus.js";
import type { AppVariables } from "../types.js";

const alertsRoute = new Hono<{ Variables: AppVariables }>();

alertsRoute.use("*", authMiddleware);

alertsRoute.get("/", async (c) => {
  const rows = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  return c.json(rows);
});

alertsRoute.post("/", requireRole("admin", "coordinator"), zValidator("json", createAlertSchema), async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");
  const [alert] = await db
    .insert(alerts)
    .values({ ...input, createdBy: user.id })
    .returning();

  await publishNotification(null, "alert_created", alert.message, { alertId: alert.id, createdBy: alert.createdBy });

  return c.json(alert, 201);
});

alertsRoute.put("/:id", zValidator("json", updateAlertSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");
  const [existing] = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  if (!existing) {
    return c.json({ error: "Alerta não encontrado" }, 404);
  }
  if (!isAlertAuthor(user, existing)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  const input = c.req.valid("json");
  const [alert] = await db.update(alerts).set(input).where(eq(alerts.id, id)).returning();
  return c.json(alert);
});

alertsRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = c.get("user");
  const [existing] = await db.select().from(alerts).where(eq(alerts.id, id)).limit(1);
  if (!existing) {
    return c.json({ error: "Alerta não encontrado" }, 404);
  }
  if (!isAlertAuthor(user, existing)) {
    return c.json({ error: "Acesso negado" }, 403);
  }

  await db.delete(alerts).where(eq(alerts.id, id));
  return c.json({ success: true });
});

export default alertsRoute;
