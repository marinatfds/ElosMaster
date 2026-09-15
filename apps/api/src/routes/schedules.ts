import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc } from "drizzle-orm";
import { createScheduleSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { schedules } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const schedulesRoute = new Hono<{ Variables: AppVariables }>();

schedulesRoute.use("*", authMiddleware);
schedulesRoute.use("*", requireRole("admin", "treinador"));

schedulesRoute.get("/", async (c) => {
  const rows = await db.select().from(schedules).orderBy(desc(schedules.date));
  return c.json(rows);
});

schedulesRoute.post("/", zValidator("json", createScheduleSchema), async (c) => {
  const input = c.req.valid("json");
  const [schedule] = await db.insert(schedules).values(input).returning();
  return c.json(schedule, 201);
});

export default schedulesRoute;
