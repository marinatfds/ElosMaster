import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { createScheduleSchema, updateScheduleSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { schedules } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { isForeignKeyViolation, UNKNOWN_CAMPUS_MESSAGE } from "../services/campuses.js";
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
  try {
    const [schedule] = await db.insert(schedules).values(input).returning();
    return c.json(schedule, 201);
  } catch (err) {
    if (isForeignKeyViolation(err)) return c.json({ error: UNKNOWN_CAMPUS_MESSAGE }, 400);
    throw err;
  }
});

schedulesRoute.put("/:id", requireRole("admin"), zValidator("json", updateScheduleSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");
  try {
    const [schedule] = await db.update(schedules).set(input).where(eq(schedules.id, id)).returning();
    if (!schedule) {
      return c.json({ error: "Horário não encontrado" }, 404);
    }
    return c.json(schedule);
  } catch (err) {
    if (isForeignKeyViolation(err)) return c.json({ error: UNKNOWN_CAMPUS_MESSAGE }, 400);
    throw err;
  }
});

export default schedulesRoute;
