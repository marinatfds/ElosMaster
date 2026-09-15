import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { createScheduleSchema, updateScheduleSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { schedules } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const schedulesRoute = new Hono<{ Variables: AppVariables }>();

schedulesRoute.use("*", authMiddleware);

schedulesRoute.get("/", async (c) => {
  const rows = await db.select().from(schedules).orderBy(desc(schedules.date));
  return c.json(rows);
});

schedulesRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id)).limit(1);
  if (!schedule) {
    return c.json({ error: "Horário não encontrado" }, 404);
  }
  return c.json(schedule);
});

schedulesRoute.post("/", requireRole("admin"), zValidator("json", createScheduleSchema), async (c) => {
  const input = c.req.valid("json");
  const [schedule] = await db.insert(schedules).values(input).returning();
  return c.json(schedule, 201);
});

schedulesRoute.put("/:id", requireRole("admin"), zValidator("json", updateScheduleSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");
  const [schedule] = await db.update(schedules).set(input).where(eq(schedules.id, id)).returning();
  if (!schedule) {
    return c.json({ error: "Horário não encontrado" }, 404);
  }
  return c.json(schedule);
});

export default schedulesRoute;
