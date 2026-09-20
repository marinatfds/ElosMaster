import { z } from "zod";

// Mesma convenção de Date.getDay(): 0 = domingo ... 6 = sábado.
export const DEFAULT_AULA_WEEKDAYS = [6];

const weekdaySchema = z.number().int().min(0).max(6);

export const calendarSettingsSchema = z.object({
  aulaStart: z.iso.date().nullable(),
  aulaEnd: z.iso.date().nullable(),
  aulaWeekdays: z.array(weekdaySchema),
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

export const updateAulaWeekdaysSchema = z.object({
  aulaWeekdays: z
    .array(weekdaySchema)
    .min(1, "Selecione ao menos um dia de funcionamento")
    .transform((days) => [...new Set(days)].sort((a, b) => a - b)),
});

export type UpdateAulaWeekdaysInput = z.input<typeof updateAulaWeekdaysSchema>;

export const createExtraClassSchema = z.object({
  date: z.iso.date(),
});

export type CreateExtraClassInput = z.infer<typeof createExtraClassSchema>;

export const extraClassSchema = createExtraClassSchema.extend({
  id: z.number().int(),
});

export type ExtraClass = z.infer<typeof extraClassSchema>;

export const createCancelledClassSchema = z.object({
  date: z.iso.date(),
});

export type CreateCancelledClassInput = z.infer<typeof createCancelledClassSchema>;

export const cancelledClassSchema = createCancelledClassSchema.extend({
  id: z.number().int(),
});

export type CancelledClass = z.infer<typeof cancelledClassSchema>;

export const holidaySchema = z.object({
  date: z.iso.date(),
  name: z.string(),
});

export type Holiday = z.infer<typeof holidaySchema>;

export const annualCalendarDataSchema = z.object({
  settings: calendarSettingsSchema,
  extraClasses: z.array(extraClassSchema),
  cancelledClasses: z.array(cancelledClassSchema),
  examDates: z.array(z.iso.date()),
  holidays: z.array(holidaySchema),
});

export type AnnualCalendarData = z.infer<typeof annualCalendarDataSchema>;
