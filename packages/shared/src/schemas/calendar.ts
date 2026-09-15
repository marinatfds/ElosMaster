import { z } from "zod";

export const calendarSettingsSchema = z.object({
  aulaStart: z.iso.date().nullable(),
  aulaEnd: z.iso.date().nullable(),
});

export type CalendarSettings = z.infer<typeof calendarSettingsSchema>;

export const updateCalendarSettingsSchema = z
  .object({
    aulaStart: z.iso.date(),
    aulaEnd: z.iso.date(),
  })
  .refine((v) => v.aulaStart <= v.aulaEnd, {
    message: "A data final deve ser após a data inicial",
    path: ["aulaEnd"],
  });

export type UpdateCalendarSettingsInput = z.infer<typeof updateCalendarSettingsSchema>;

export const createExtraClassSchema = z.object({
  date: z.iso.date(),
});

export type CreateExtraClassInput = z.infer<typeof createExtraClassSchema>;

export const extraClassSchema = createExtraClassSchema.extend({
  id: z.number().int(),
});

export type ExtraClass = z.infer<typeof extraClassSchema>;

export const holidaySchema = z.object({
  date: z.iso.date(),
  name: z.string(),
});

export type Holiday = z.infer<typeof holidaySchema>;

export const annualCalendarDataSchema = z.object({
  settings: calendarSettingsSchema,
  extraClasses: z.array(extraClassSchema),
  examDates: z.array(z.iso.date()),
  holidays: z.array(holidaySchema),
});

export type AnnualCalendarData = z.infer<typeof annualCalendarDataSchema>;
