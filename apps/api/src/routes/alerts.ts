import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc } from "drizzle-orm";
import { createAlertSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { alerts } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const alertsRoute = new Hono<{ Variables: AppVariables }>();

alertsRoute.use("*", authMiddleware);

alertsRoute.get("/", async (c) => {
  const rows = await db.select().from(alerts).orderBy(desc(alerts.createdAt));
  return c.json(rows);
});

alertsRoute.post("/", requireRole("admin", "treinador"), zValidator("json", createAlertSchema), async (c) => {
  const input = c.req.valid("json");
  const user = c.get("user");
  const [alert] = await db
    .insert(alerts)
    .values({ ...input, createdBy: user.id })
    .returning();
  return c.json(alert, 201);
});

export default alertsRoute;
