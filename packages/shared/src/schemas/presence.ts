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

export const bulkPresenceSchema = z.object({
  records: z.array(createPresenceRecordSchema).min(1),
});

export type BulkPresenceInput = z.infer<typeof bulkPresenceSchema>;

export const rosterPresenceSchema = z.object({
  studentId: z.number().int(),
  studentName: z.string(),
  present: z.boolean().nullable(),
  comment: z.string().nullable(),
});

export type RosterPresence = z.infer<typeof rosterPresenceSchema>;
