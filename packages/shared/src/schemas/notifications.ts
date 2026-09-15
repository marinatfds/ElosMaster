import { z } from "zod";

export const NOTIFICATION_TYPES = ["alert_created", "grade_posted", "presence_posted"] as const;

export const notificationSchema = z.object({
  id: z.number().int(),
  type: z.enum(NOTIFICATION_TYPES),
  payload: z.record(z.string(), z.unknown()),
  read: z.boolean(),
  createdAt: z.iso.datetime(),
});

export type Notification = z.infer<typeof notificationSchema>;
