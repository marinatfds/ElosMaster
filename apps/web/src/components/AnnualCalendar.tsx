import { useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DayPicker } from "react-day-picker";
import { ptBR as dayPickerPtBR } from "react-day-picker/locale";
import "react-day-picker/style.css";

function getSaturdaysInRange(year: number, startMonth: number, endMonth: number): Date[] {
  const dates: Date[] = [];
  const cursor = new Date(year, startMonth, 1);
  const end = new Date(year, endMonth + 1, 0);
  while (cursor <= end) {
    if (cursor.getDay() === 6) {
      dates.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return dates;
}

// Aulas de sábado: todos os sábados entre abril (3) e novembro (10) de 2026.
const AULA_DATES = getSaturdaysInRange(2026, 3, 10);

// Simulados: 8 domingos sorteados entre abril e novembro de 2026.
const SIMULADO_DATES = [
  new Date(2026, 4, 31),
  new Date(2026, 5, 28),
  new Date(2026, 6, 19),
  new Date(2026, 6, 26),
  new Date(2026, 7, 9),
  new Date(2026, 7, 23),
  new Date(2026, 9, 4),
  new Date(2026, 10, 29),
];

export function AnnualCalendar() {
  const theme = useTheme();
  const [month, setMonth] = useState(() => new Date());

  return (
    <Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: theme.palette.primary.main }} />
          <Typography variant="body2">Aulas de sábado</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: theme.palette.warning.main }} />
          <Typography variant="body2">Simulados</Typography>
        </Box>
      </Box>
      <Paper sx={{ p: 2, display: "inline-block" }}>
        <DayPicker
          locale={dayPickerPtBR}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          modifiers={{ aula: AULA_DATES, simulado: SIMULADO_DATES }}
          modifiersStyles={{
            aula: {
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              borderRadius: "50%",
            },
            simulado: {
              backgroundColor: theme.palette.warning.main,
              color: theme.palette.warning.contrastText,
              borderRadius: "50%",
            },
          }}
        />
      </Paper>
    </Box>
  );
}
