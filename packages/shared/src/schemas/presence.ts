import { z } from "zod";

export const PERIODS = ["morning", "afternoon"] as const;

export const createPresenceRecordSchema = z.object({
  studentId: z.number().int(),
  classDate: z.iso.date(),
  period: z.enum(PERIODS),
  present: z.boolean(),
  comment: z.string().max(1000).optional(),
});

export type CreatePresenceRecordInput = z.infer<typeof createPresenceRecordSchema>;

export const presenceRecordSchema = createPresenceRecordSchema.extend({
  id: z.number().int(),
});

export type PresenceRecord = z.infer<typeof presenceRecordSchema>;
