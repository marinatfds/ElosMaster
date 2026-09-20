import {
  boolean,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { DEFAULT_AULA_WEEKDAYS, NOTIFICATION_TYPES, PERIODS, ROLES, type ScheduleSlot } from "@elosmaster/shared";

export const roleEnum = pgEnum("role", ROLES);
export const periodEnum = pgEnum("period", PERIODS);
export const notificationTypeEnum = pgEnum("notification_type", NOTIFICATION_TYPES);

const id = () => integer().primaryKey().generatedAlwaysAsIdentity();

export const campuses = pgTable("campuses", {
  id: id(),
  name: text().notNull().unique(),
});

// Alunos, equipe e horários referenciam o campus pelo nome: renomear propaga (CASCADE)
// e excluir um campus em uso é barrado pelo banco (RESTRICT).
const campusRef = () =>
  text()
    .notNull()
    .references(() => campuses.name, { onUpdate: "cascade", onDelete: "restrict" });

export const students = pgTable("students", {
  id: id(),
  name: text().notNull(),
  campus: campusRef(),
  active: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: id(),
  name: text().notNull(),
  email: text().notNull().unique(),
  passwordHash: text().notNull(),
  role: roleEnum().notNull(),
  studentId: integer().references(() => students.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const teamPositions = pgTable("team_positions", {
  id: id(),
  name: text().notNull().unique(),
});

export const teamMembers = pgTable("team_members", {
  id: id(),
  name: text().notNull(),
  campus: campusRef(),
  position: text().notNull(),
  email: text().notNull(),
  phone: text().notNull(),
});

export const alerts = pgTable("alerts", {
  id: id(),
  message: text().notNull(),
  createdBy: integer()
    .notNull()
    .references(() => users.id),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const charges = pgTable("charges", {
  id: id(),
  expenseType: text().notNull(),
  description: text().notNull(),
  author: text().notNull(),
  value: numeric({ precision: 10, scale: 2, mode: "number" }).notNull(),
  inclusionDate: timestamp({ withTimezone: true }).notNull().defaultNow(),
  paymentDate: date().notNull(),
});

export const exams = pgTable("exams", {
  id: id(),
  name: text().notNull(),
  examDate: date().notNull(),
});

export const examGrades = pgTable(
  "exam_grades",
  {
    id: id(),
    examId: integer()
      .notNull()
      .references(() => exams.id),
    studentId: integer()
      .notNull()
      .references(() => students.id),
    grade: numeric({ precision: 4, scale: 2, mode: "number" }).notNull(),
  },
  (table) => [unique().on(table.examId, table.studentId)],
);

export const presenceRecords = pgTable(
  "presence_records",
  {
    id: id(),
    studentId: integer()
      .notNull()
      .references(() => students.id),
    classDate: date().notNull(),
    period: periodEnum().notNull(),
    present: boolean().notNull(),
    comment: text(),
  },
  (table) => [unique().on(table.studentId, table.classDate, table.period)],
);

export const schedules = pgTable(
  "schedules",
  {
    id: id(),
    campus: campusRef(),
    date: date().notNull(),
    slots: jsonb().notNull().$type<ScheduleSlot[]>(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique().on(table.campus, table.date)],
);

export const calendarSettings = pgTable("calendar_settings", {
  id: id(),
  aulaStart: date(),
  aulaEnd: date(),
  aulaWeekdays: integer().array().notNull().default(DEFAULT_AULA_WEEKDAYS),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const extraClasses = pgTable("extra_classes", {
  id: id(),
  date: date().notNull().unique(),
});

export const notifications = pgTable("notifications", {
  id: id(),
  targetUserId: integer().references(() => users.id),
  type: notificationTypeEnum().notNull(),
  payload: jsonb().notNull().$type<Record<string, unknown>>(),
  read: boolean().notNull().default(false),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, { fields: [users.studentId], references: [students.id] }),
}));

export const studentsRelations = relations(students, ({ many }) => ({
  users: many(users),
  examGrades: many(examGrades),
  presenceRecords: many(presenceRecords),
}));

export const examsRelations = relations(exams, ({ many }) => ({
  grades: many(examGrades),
}));

export const examGradesRelations = relations(examGrades, ({ one }) => ({
  exam: one(exams, { fields: [examGrades.examId], references: [exams.id] }),
  student: one(students, { fields: [examGrades.studentId], references: [students.id] }),
}));

export const presenceRecordsRelations = relations(presenceRecords, ({ one }) => ({
  student: one(students, { fields: [presenceRecords.studentId], references: [students.id] }),
}));
