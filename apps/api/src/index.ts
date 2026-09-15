import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import authRoutes from "./routes/auth.js";
import studentsRoutes from "./routes/students.js";
import teamRoutes from "./routes/team.js";
import alertsRoutes from "./routes/alerts.js";
import chargesRoutes from "./routes/charges.js";
import schedulesRoutes from "./routes/schedules.js";
import examsRoutes from "./routes/exams.js";
import calendarRoutes from "./routes/calendar.js";
import presenceRoutes from "./routes/presence.js";
import notificationsRoutes from "./routes/notifications.js";
import reportsRoutes from "./routes/reports.js";
import driveRoutes from "./routes/drive.js";
import { closeBrowser } from "./services/pdf.js";
import type { AppVariables } from "./types.js";

const app = new Hono<{ Variables: AppVariables }>();

app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);

app.get("/health", (c) => c.json({ ok: true }));

app.route("/auth", authRoutes);
app.route("/students", studentsRoutes);
app.route("/team", teamRoutes);
app.route("/alerts", alertsRoutes);
app.route("/charges", chargesRoutes);
app.route("/schedules", schedulesRoutes);
app.route("/exams", examsRoutes);
app.route("/calendar", calendarRoutes);
app.route("/presence", presenceRoutes);
app.route("/notifications", notificationsRoutes);
app.route("/reports", reportsRoutes);
app.route("/drive", driveRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Erro interno no servidor" }, 500);
});

const port = Number(process.env.PORT ?? 8787);

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    await closeBrowser();
    process.exit(0);
  });
}
