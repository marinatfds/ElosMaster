import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { and, desc, eq, isNull, or } from "drizzle-orm";
import { db } from "../db/client.js";
import { notifications } from "../db/schema.js";
import { authMiddleware } from "../middleware/auth.js";
import { subscribe } from "../services/notification-bus.js";
import type { AppVariables } from "../types.js";

const notificationsRoute = new Hono<{ Variables: AppVariables }>();

notificationsRoute.use("*", authMiddleware);

function visibleToUser(userId: number) {
  return or(eq(notifications.targetUserId, userId), isNull(notifications.targetUserId));
}

notificationsRoute.get("/", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(notifications)
    .where(visibleToUser(user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
  return c.json(rows);
});

notificationsRoute.get("/stream", (c) => {
  const user = c.get("user");

  return streamSSE(c, async (stream) => {
    let closed = false;
    const unsubscribe = subscribe(user.id, (notification) => {
      void stream.writeSSE({ event: "notification", data: JSON.stringify(notification) });
    });

    stream.onAbort(() => {
      closed = true;
      unsubscribe();
    });

    while (!closed) {
      await stream.sleep(15000);
      if (!closed) {
        await stream.writeSSE({ event: "ping", data: "" });
      }
    }
  });
});

notificationsRoute.patch("/:id/read", async (c) => {
  const user = c.get("user");
  const id = Number(c.req.param("id"));

  const [updated] = await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, id), visibleToUser(user.id)))
    .returning();

  if (!updated) {
    return c.json({ error: "Notificação não encontrada" }, 404);
  }
  return c.json(updated);
});

export default notificationsRoute;
