import { z } from "zod";
import { CAMPUSES } from "../roles.js";

export const SCHEDULE_START_TIME = "08:00";

export const SCHEDULE_ACTIVITIES = [
  { name: "Monitoria Matemática", durationMinutes: 60 },
  { name: "Roda", durationMinutes: 60 },
  { name: "Escrita", durationMinutes: 90 },
  { name: "Leitura", durationMinutes: 90 },
  { name: "PCS", durationMinutes: 60 },
  { name: "Álgebra", durationMinutes: 60 },
  { name: "Geometria", durationMinutes: 60 },
  { name: "Aritmética", durationMinutes: 60 },
  { name: "Intervalo", durationMinutes: 30 },
  { name: "Almoço", durationMinutes: 60 },
] as const;

export const SCHEDULE_ACTIVITY_NAMES = SCHEDULE_ACTIVITIES.map((activity) => activity.name) as [
  (typeof SCHEDULE_ACTIVITIES)[number]["name"],
  ...(typeof SCHEDULE_ACTIVITIES)[number]["name"][],
];

export function getActivityDurationMinutes(name: string): number {
  return SCHEDULE_ACTIVITIES.find((activity) => activity.name === name)?.durationMinutes ?? 0;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(":").map(Number);
  const total = hours * 60 + mins + minutes;
  const newHours = Math.floor(total / 60) % 24;
  const newMins = total % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
}

export function computeSlotTime(previousEndTime: string | undefined, activityName: string) {
  const startTime = previousEndTime ?? SCHEDULE_START_TIME;
  const endTime = addMinutes(startTime, getActivityDurationMinutes(activityName));
  return { startTime, endTime };
}

export const scheduleSlotSchema = z.object({
  name: z.enum(SCHEDULE_ACTIVITY_NAMES),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  responsible: z.string().min(1, "Responsável obrigatório"),
  room: z.string().min(1, "Sala obrigatória"),
});

export type ScheduleSlot = z.infer<typeof scheduleSlotSchema>;

export const createScheduleSchema = z.object({
  campus: z.enum(CAMPUSES),
  date: z.iso.date(),
  slots: z
    .array(scheduleSlotSchema)
    .length(SCHEDULE_ACTIVITIES.length, `São necessários ${SCHEDULE_ACTIVITIES.length} horários`)
    .refine(
      (slots) => new Set(slots.map((slot) => slot.name)).size === slots.length,
      "Cada atividade deve ser usada apenas uma vez",
    ),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;

export const updateScheduleSchema = createScheduleSchema;

export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;

export const scheduleSchema = createScheduleSchema.extend({
  id: z.number().int(),
  createdAt: z.iso.datetime(),
});

export type Schedule = z.infer<typeof scheduleSchema>;
