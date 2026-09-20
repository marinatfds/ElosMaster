import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DayPicker } from "react-day-picker";
import { ptBR as dayPickerPtBR } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { getAnnualCalendar } from "../api/calendar";

function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toISODate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function getClassDatesInRange(startIso: string, endIso: string, weekdays: number[]): Date[] {
  const cursor = parseISODate(startIso);
  const end = parseISODate(endIso);
  const dates: Date[] = [];
  while (cursor <= end) {
    if (weekdays.includes(cursor.getDay())) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

type LegendItemProps = { color: string; label: string };

function LegendItem({ color, label }: LegendItemProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: color }} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

export function AnnualCalendar() {
  const theme = useTheme();
  const [month, setMonth] = useState(() => new Date());
  const query = useQuery({ queryKey: ["calendar"], queryFn: getAnnualCalendar });

  const cancelledIsos = useMemo(
    () => new Set((query.data?.cancelledClasses ?? []).map((c) => c.date)),
    [query.data],
  );

  const aulaDates = useMemo(() => {
    const { aulaStart, aulaEnd, aulaWeekdays } = query.data?.settings ?? {};
    if (!aulaStart || !aulaEnd || !aulaWeekdays) return [];
    return getClassDatesInRange(aulaStart, aulaEnd, aulaWeekdays).filter((d) => !cancelledIsos.has(toISODate(d)));
  }, [query.data, cancelledIsos]);

  const simuladoDates = useMemo(
    () => (query.data?.examDates ?? []).map(parseISODate),
    [query.data],
  );

  const aulaExtraDates = useMemo(
    () =>
      (query.data?.extraClasses ?? []).filter((e) => !cancelledIsos.has(e.date)).map((e) => parseISODate(e.date)),
    [query.data, cancelledIsos],
  );

  const aulaCanceladaDates = useMemo(
    () => (query.data?.cancelledClasses ?? []).map((c) => parseISODate(c.date)),
    [query.data],
  );

  const feriadoDates = useMemo(
    () => (query.data?.holidays ?? []).map((h) => parseISODate(h.date)),
    [query.data],
  );

  const colors = {
    aula: theme.palette.primary.main,
    simulado: theme.palette.warning.main,
    aulaExtra: "#fbc02d",
    aulaCancelada: theme.palette.grey[500],
    feriado: theme.palette.info.main,
  };

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 2 }}>
        <LegendItem color={colors.aula} label="Aulas" />
        <LegendItem color={colors.aulaExtra} label="Aulas extras" />
        <LegendItem color={colors.simulado} label="Simulados" />
        <LegendItem color={colors.feriado} label="Feriados" />
        <LegendItem color={colors.aulaCancelada} label="Aulas canceladas" />
      </Box>
      <Paper sx={{ p: 2, display: "inline-block" }}>
        <DayPicker
          locale={dayPickerPtBR}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          modifiers={{
            aula: aulaDates,
            simulado: simuladoDates,
            aulaExtra: aulaExtraDates,
            aulaCancelada: aulaCanceladaDates,
            feriado: feriadoDates,
          }}
          modifiersStyles={{
            aula: { backgroundColor: colors.aula, color: theme.palette.getContrastText(colors.aula), borderRadius: "50%" },
            simulado: {
              backgroundColor: colors.simulado,
              color: theme.palette.getContrastText(colors.simulado),
              borderRadius: "50%",
            },
            aulaExtra: {
              backgroundColor: colors.aulaExtra,
              color: theme.palette.getContrastText(colors.aulaExtra),
              borderRadius: "50%",
            },
            aulaCancelada: {
              backgroundColor: colors.aulaCancelada,
              color: theme.palette.getContrastText(colors.aulaCancelada),
              borderRadius: "50%",
            },
            feriado: {
              backgroundColor: colors.feriado,
              color: theme.palette.getContrastText(colors.feriado),
              borderRadius: "50%",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
