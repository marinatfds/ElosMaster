import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc } from "drizzle-orm";
import { createChargeSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { charges } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const chargesRoute = new Hono<{ Variables: AppVariables }>();

chargesRoute.use("*", authMiddleware);
chargesRoute.use("*", requireRole("admin", "treinador"));

chargesRoute.get("/", async (c) => {
  const rows = await db.select().from(charges).orderBy(desc(charges.paymentDate));
  return c.json(rows);
});

chargesRoute.post("/", zValidator("json", createChargeSchema), async (c) => {
  const input = c.req.valid("json");
  const [charge] = await db.insert(charges).values(input).returning();
  return c.json(charge, 201);
});

export default chargesRoute;
