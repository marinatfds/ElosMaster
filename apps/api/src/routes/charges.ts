import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { desc, eq } from "drizzle-orm";
import { createChargeSchema, updateChargeSchema } from "@elosmaster/shared";
import { db } from "../db/client.js";
import { charges } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { requireRole } from "../middleware/rbac.js";
import type { AppVariables } from "../types.js";

const chargesRoute = new Hono<{ Variables: AppVariables }>();

chargesRoute.use("*", authMiddleware);
chargesRoute.use("*", requireRole("admin", "coordinator"));

chargesRoute.get("/", async (c) => {
  const rows = await db.select().from(charges).orderBy(desc(charges.paymentDate));
  return c.json(rows);
});

chargesRoute.get("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [charge] = await db.select().from(charges).where(eq(charges.id, id)).limit(1);
  if (!charge) {
    return c.json({ error: "Despesa não encontrada" }, 404);
  }
  return c.json(charge);
});

chargesRoute.post("/", zValidator("json", createChargeSchema), async (c) => {
  const input = c.req.valid("json");
  const [charge] = await db.insert(charges).values(input).returning();
  return c.json(charge, 201);
});

chargesRoute.put("/:id", zValidator("json", updateChargeSchema), async (c) => {
  const id = Number(c.req.param("id"));
  const input = c.req.valid("json");
  const [charge] = await db.update(charges).set(input).where(eq(charges.id, id)).returning();
  if (!charge) {
    return c.json({ error: "Despesa não encontrada" }, 404);
  }
  return c.json(charge);
});

chargesRoute.delete("/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const [charge] = await db.delete(charges).where(eq(charges.id, id)).returning();
  if (!charge) {
    return c.json({ error: "Despesa não encontrada" }, 404);
  }
  return c.json({ success: true });
});

export default chargesRoute;
