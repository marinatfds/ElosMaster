import "dotenv/config";
import sql from "mssql";
import { eq } from "drizzle-orm";
import { CAMPUSES, EXPENSE_TYPES, type Campus, type CreateChargeInput } from "@elosmaster/shared";
import { db } from "../src/db/client.js";
import { alerts, charges, teamMembers, users } from "../src/db/schema.js";

const FORCE = process.argv.includes("--force");
const DRY_RUN = process.argv.includes("--dry-run");

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeCampus(raw: string, context: string): Campus | null {
  const match = CAMPUSES.find((c) => c.toLowerCase() === raw.trim().toLowerCase());
  if (!match) {
    console.warn(`  ! Núcleo desconhecido "${raw}" em ${context} — registro pulado`);
    return null;
  }
  return match;
}

function normalizeExpenseType(raw: string): CreateChargeInput["expenseType"] {
  const match = EXPENSE_TYPES.find((t) => t.toLowerCase() === raw.trim().toLowerCase());
  return match ?? "Outros";
}

async function main() {
  const legacyConnectionString = process.env.LEGACY_MSSQL_CONNECTION_STRING;
  if (!legacyConnectionString) {
    throw new Error("LEGACY_MSSQL_CONNECTION_STRING não definida no .env");
  }

  console.log(DRY_RUN ? "Modo simulação (--dry-run): nada será gravado no Postgres.\n" : "");

  // The new schema requires alerts.createdBy -> users.id; the legacy app had no auth,
  // so migrated alerts are attributed to the first admin account found.
  const [adminUser] = await db.select().from(users).where(eq(users.role, "admin")).limit(1);
  if (!adminUser) {
    throw new Error(
      "Nenhum usuário admin encontrado no Postgres. Rode `npm run db:seed-admin` antes de migrar.",
    );
  }

  if (!FORCE) {
    const [existingAlert] = await db.select({ id: alerts.id }).from(alerts).limit(1);
    const [existingCharge] = await db.select({ id: charges.id }).from(charges).limit(1);
    const [existingMember] = await db.select({ id: teamMembers.id }).from(teamMembers).limit(1);
    if (existingAlert || existingCharge || existingMember) {
      throw new Error(
        "Já existem dados em alerts/charges/team_members no Postgres. " +
          "Rode de novo com --force se quiser migrar mesmo assim (pode duplicar registros).",
      );
    }
  }

  const pool = await sql.connect(legacyConnectionString);

  const summary: Record<string, { source: number; imported: number; skipped: number }> = {};

  // --- Alerts ---
  const alertRows = (await pool.request().query("SELECT Alert, DateTime FROM Alerts")).recordset as {
    Alert: string;
    DateTime: Date;
  }[];
  summary.alerts = { source: alertRows.length, imported: 0, skipped: 0 };
  const alertsToInsert = alertRows.map((row) => ({
    message: row.Alert,
    createdBy: adminUser.id,
    createdAt: row.DateTime,
  }));
  summary.alerts.imported = alertsToInsert.length;

  // --- Charges (Tresure) ---
  const chargeRows = (
    await pool
      .request()
      .query(
        "SELECT Expense_Type, Description, Author, Value, DateTime_Inclusion, DateTime_Payment FROM Tresure",
      )
  ).recordset as {
    Expense_Type: string;
    Description: string;
    Author: string;
    Value: number;
    DateTime_Inclusion: Date;
    DateTime_Payment: Date;
  }[];
  summary.charges = { source: chargeRows.length, imported: 0, skipped: 0 };
  const chargesToInsert = chargeRows.map((row) => {
    const normalizedType = normalizeExpenseType(row.Expense_Type);
    const description =
      normalizedType === row.Expense_Type.trim()
        ? row.Description
        : `${row.Description} (tipo original: ${row.Expense_Type})`;
    return {
      expenseType: normalizedType,
      description,
      author: row.Author,
      value: row.Value,
      inclusionDate: row.DateTime_Inclusion,
      paymentDate: toDateOnly(row.DateTime_Payment),
    };
  });
  summary.charges.imported = chargesToInsert.length;

  // --- Team ---
  const teamRows = (
    await pool.request().query("SELECT Name, Campus, Position, Email, Phone FROM Team ORDER BY Name")
  ).recordset as { Name: string; Campus: string; Position: string; Email: string; Phone: string }[];
  summary.team_members = { source: teamRows.length, imported: 0, skipped: 0 };
  const teamToInsert: (typeof teamMembers.$inferInsert)[] = [];
  for (const row of teamRows) {
    const campus = normalizeCampus(row.Campus, `Team (${row.Name})`);
    if (!campus) {
      summary.team_members.skipped++;
      continue;
    }
    teamToInsert.push({ name: row.Name, campus, position: row.Position, email: row.Email, phone: row.Phone });
  }
  summary.team_members.imported = teamToInsert.length;

  // --- Tests / Presence: schema changed completely (normalized exams/presence tables,
  // no Students table existed in the legacy DB), and the legacy INSERTs were malformed —
  // there is no safe automatic mapping, so we only report what's there for manual review.
  for (const [table, columns] of [
    ["Tests", "StudentId, Grade1"],
    ["Presence", "StudentId, PresenceMorning"],
  ] as const) {
    try {
      const rows = (await pool.request().query(`SELECT ${columns} FROM ${table}`)).recordset;
      console.log(
        `  i ${table}: ${rows.length} registro(s) encontrados, mas não têm uma migração automática segura ` +
          `(schema incompatível — não havia tabela de alunos na base antiga). Revise manualmente se necessário.`,
      );
    } catch (err) {
      console.log(`  i ${table}: não foi possível ler (${(err as Error).message}) — provavelmente vazia/corrompida.`);
    }
  }

  await pool.close();

  if (!DRY_RUN) {
    await db.transaction(async (tx) => {
      if (alertsToInsert.length > 0) await tx.insert(alerts).values(alertsToInsert);
      if (chargesToInsert.length > 0) await tx.insert(charges).values(chargesToInsert);
      if (teamToInsert.length > 0) await tx.insert(teamMembers).values(teamToInsert);
    });
  }

  console.log("\nResumo da migração:");
  for (const [table, counts] of Object.entries(summary)) {
    console.log(
      `  ${table}: ${counts.source} na origem -> ${counts.imported} migrados, ${counts.skipped} pulados`,
    );
  }
  if (DRY_RUN) {
    console.log("\nNenhuma alteração foi gravada (--dry-run). Rode sem essa flag para migrar de verdade.");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("\nMigração falhou:", err.message);
  process.exit(1);
});
