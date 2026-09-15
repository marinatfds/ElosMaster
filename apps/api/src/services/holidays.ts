import type { Holiday } from "@elosmaster/shared";

const TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<number, { data: Holiday[]; fetchedAt: number }>();

async function getHolidaysForYear(year: number): Promise<Holiday[]> {
  const cached = cache.get(year);
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.data;
  }

  try {
    const res = await fetch(`https://brasilapi.com.br/api/feriados/v1/${year}`);
    if (!res.ok) throw new Error(`BrasilAPI respondeu ${res.status}`);
    const data = (await res.json()) as { date: string; name: string }[];
    const holidays = data.map((h) => ({ date: h.date, name: h.name }));
    cache.set(year, { data: holidays, fetchedAt: Date.now() });
    return holidays;
  } catch (err) {
    console.error("Falha ao buscar feriados nacionais", err);
    return cached?.data ?? [];
  }
}

export async function getHolidaysInRange(start: string | null, end: string | null): Promise<Holiday[]> {
  if (!start || !end) return [];

  const startYear = new Date(start).getFullYear();
  const endYear = new Date(end).getFullYear();
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  const results = await Promise.all(years.map(getHolidaysForYear));
  return results.flat().filter((h) => h.date >= start && h.date <= end);
}
