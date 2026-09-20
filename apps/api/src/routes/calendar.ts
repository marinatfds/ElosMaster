import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import {
  createExtraClassSchema,
  DEFAULT_AULA_WEEKDAYS,
  updateAulaWeekdaysSchema,
  updateCalendarSettingsSchema,
  type AnnualCalendarData,
} from "@elosmaster/shared";
import { db } from "../db/client.js";
import { calendarSettings, extraClasses, exams } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import { getHolidaysInRange } from "../services/holidays.js";
import type { AppVariables } from "../types.js";

const calendarRoute = new Hono<{ Variables: AppVariables }>();

calendarRoute.use("*", authMiddleware);

calendarRoute.get("/", async (c) => {
  const [settingsRow] = await db.select().from(calendarSettings).limit(1);
  const extraClassRows = await db.select().from(extraClasses).orderBy(extraClasses.date);
  const examRows = await db.select({ examDate: exams.examDate }).from(exams).orderBy(exams.examDate);

  const aulaStart = settingsRow?.aulaStart ?? null;
  const aulaEnd = settingsRow?.aulaEnd ?? null;
  const holidays = await getHolidaysInRange(aulaStart, aulaEnd);

  const result: AnnualCalendarData = {
    settings: { aulaStart, aulaEnd, aulaWeekdays: settingsRow?.aulaWeekdays ?? DEFAULT_AULA_WEEKDAYS },
    extraClasses: extraClassRows,
    examDates: examRows.map((row) => row.examDate),
    holidays,
  };

  return c.json(result);
});

calendarRoute.put(
  "/settings",
  requireRole("admin"),
  zValidator("json", updateCalendarSettingsSchema),
  async (c) => {
    const input = c.req.valid("json");
    const [existing] = await db.select().from(calendarSettings).limit(1);

    const [row] = existing
      ? await db
          .update(calendarSettings)
          .set({ aulaStart: input.aulaStart, aulaEnd: input.aulaEnd, updatedAt: new Date() })
          .where(eq(calendarSettings.id, existing.id))
          .returning()
      : await db.insert(calendarSettings).values(input).returning();

    return c.json({ aulaStart: row.aulaStart, aulaEnd: row.aulaEnd, aulaWeekdays: row.aulaWeekdays });
  },
);

calendarRoute.put(
  "/settings/weekdays",
  requireRole("admin"),
  zValidator("json", updateAulaWeekdaysSchema),
  async (c) => {
    const { aulaWeekdays } = c.req.valid("json");
    const [existing] = await db.select().from(calendarSettings).limit(1);

    const [row] = existing
      ? await db
          .update(calendarSettings)
          .set({ aulaWeekdays, updatedAt: new Date() })
          .where(eq(calendarSettings.id, existing.id))
          .returning()
      : await db.insert(calendarSettings).values({ aulaWeekdays }).returning();

    return c.json({ aulaStart: row.aulaStart, aulaEnd: row.aulaEnd, aulaWeekdays: row.aulaWeekdays });
  },
);

calendarRoute.post(
  "/extra-classes",
  requireRole("admin"),
  zValidator("json", createExtraClassSchema),
  async (c) => {
    const input = c.req.valid("json");
    const [row] = await db.insert(extraClasses).values(input).onConflictDoNothing().returning();
    if (!row) {
      return c.json({ error: "Essa data já está cadastrada como aula extra" }, 409);
    }
    return c.json(row, 201);
  },
);

calendarRoute.delete("/extra-classes/:id", requireRole("admin"), async (c) => {
  const id = Number(c.req.param("id"));
  await db.delete(extraClasses).where(eq(extraClasses.id, id));
  return c.body(null, 204);
});

export default calendarRoute;
