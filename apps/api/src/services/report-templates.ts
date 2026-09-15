import type { ExamGradeWithExam } from "@elosmaster/shared";
import type { charges, presenceRecords, students } from "../db/schema.js";

type Student = typeof students.$inferSelect;
type PresenceRecord = typeof presenceRecords.$inferSelect;
type Charge = typeof charges.$inferSelect;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const periodLabels: Record<string, string> = { morning: "Manhã", afternoon: "Tarde" };

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function baseLayout(title: string, body: string) {
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: "Segoe UI", Arial, sans-serif; color: #1a1a1a; }
  h1 { color: #a83234; font-size: 22px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 12px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #e0e0e0; font-size: 13px; }
  th { background: #f5f5f5; color: #333; }
  .total { font-weight: bold; }
  .footer { margin-top: 32px; color: #999; font-size: 11px; }
</style>
</head>
<body>
${body}
<div class="footer">Gerado em ${dateFormatter.format(new Date())} pelo ElosMaster</div>
</body>
</html>`;
}

export function boletimHtml(student: Student, grades: ExamGradeWithExam[], presence: PresenceRecord[]) {
  const gradesRows = grades
    .map(
      (g) =>
        `<tr><td>${escapeHtml(g.examName)}</td><td>${dateFormatter.format(new Date(g.examDate))}</td><td>${g.grade}</td></tr>`,
    )
    .join("");

  const presenceRows = presence
    .map(
      (p) =>
        `<tr><td>${dateFormatter.format(new Date(p.classDate))}</td><td>${periodLabels[p.period]}</td><td>${p.present ? "Presente" : "Ausente"}</td><td>${p.comment ? escapeHtml(p.comment) : ""}</td></tr>`,
    )
    .join("");

  const body = `
    <h1>Boletim do aluno</h1>
    <div class="subtitle">${escapeHtml(student.name)} — Núcleo ${escapeHtml(student.campus)}</div>

    <h2>Notas</h2>
    <table>
      <thead><tr><th>Simulado</th><th>Data</th><th>Nota</th></tr></thead>
      <tbody>${gradesRows || '<tr><td colspan="3">Nenhuma nota lançada.</td></tr>'}</tbody>
    </table>

    <h2>Presença</h2>
    <table>
      <thead><tr><th>Data</th><th>Período</th><th>Situação</th><th>Observação</th></tr></thead>
      <tbody>${presenceRows || '<tr><td colspan="4">Nenhum registro de presença.</td></tr>'}</tbody>
    </table>
  `;

  return baseLayout(`Boletim - ${student.name}`, body);
}

export function financeiroHtml(charges: Charge[]) {
  const total = charges.reduce((sum, c) => sum + c.value, 0);

  const rows = charges
    .map(
      (c) =>
        `<tr><td>${escapeHtml(c.expenseType)}</td><td>${escapeHtml(c.description)}</td><td>${escapeHtml(c.author)}</td><td>${currencyFormatter.format(c.value)}</td><td>${dateFormatter.format(new Date(c.paymentDate))}</td></tr>`,
    )
    .join("");

  const body = `
    <h1>Extrato financeiro</h1>
    <div class="subtitle">Tesouraria — ${charges.length} lançamento(s)</div>

    <table>
      <thead><tr><th>Tipo</th><th>Descrição</th><th>Autor</th><th>Valor</th><th>Data de pagamento</th></tr></thead>
      <tbody>
        ${rows || '<tr><td colspan="5">Nenhum lançamento no período.</td></tr>'}
        <tr class="total"><td colspan="3">Total</td><td>${currencyFormatter.format(total)}</td><td></td></tr>
      </tbody>
    </table>
  `;

  return baseLayout("Extrato financeiro", body);
}
