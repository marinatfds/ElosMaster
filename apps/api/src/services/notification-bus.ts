import { EventEmitter } from "node:events";
import { and, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { notifications, users } from "../db/schema.js";
import type { Notification, NOTIFICATION_TYPES } from "@elosmaster/shared";

type NotificationType = (typeof NOTIFICATION_TYPES)[number];

const emitter = new EventEmitter();
emitter.setMaxListeners(0);

const BROADCAST_EVENT = "broadcast";
const userEvent = (userId: number) => `user:${userId}`;

export function subscribe(userId: number, listener: (notification: Notification) => void) {
  emitter.on(BROADCAST_EVENT, listener);
  emitter.on(userEvent(userId), listener);
  return () => {
    emitter.off(BROADCAST_EVENT, listener);
    emitter.off(userEvent(userId), listener);
  };
}

function toNotification(row: typeof notifications.$inferSelect): Notification {
  return {
    id: row.id,
    type: row.type,
    payload: row.payload,
    read: row.read,
    createdAt: row.createdAt.toISOString(),
  };
}

/** targetUserId null = broadcast to every connected user (e.g. a new alert). */
export async function publishNotification(
  targetUserId: number | null,
  type: NotificationType,
  message: string,
  extra: Record<string, unknown> = {},
) {
  const [row] = await db
    .insert(notifications)
    .values({ targetUserId, type, payload: { message, ...extra } })
    .returning();

  const notification = toNotification(row);
  if (targetUserId === null) {
    emitter.emit(BROADCAST_EVENT, notification);
  } else {
    emitter.emit(userEvent(targetUserId), notification);
  }
  return notification;
}

/** Notifies every aluno_responsavel account linked to a student (usually one, but not assumed). */
export async function notifyGuardians(studentId: number, type: NotificationType, message: string) {
  const guardians = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.studentId, studentId), eq(users.role, "aluno_responsavel")));

  for (const guardian of guardians) {
    await publishNotification(guardian.id, type, message, { studentId });
  }
}
