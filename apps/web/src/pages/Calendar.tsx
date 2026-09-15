import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { Campus, DriveSection, Schedule } from "@elosmaster/shared";
import { AnnualCalendar } from "../components/AnnualCalendar";
import { listSchedules } from "../api/schedules";

const SECTION_LABELS: Record<DriveSection, string> = {
  fgv: "Horário FGV",
  puc: "Horário PUC",
  anual: "Calendário Anual",
};

const SECTION_CAMPUS: Partial<Record<DriveSection, Campus>> = {
  fgv: "FGV",
  puc: "PUC",
};

const weekDateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });

function startOfWeek(date: Date): Date {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const daysSinceMonday = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - daysSinceMonday);
  return start;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function ScheduleTable({ schedule }: { schedule: Schedule }) {
  return (
    <Paper>
      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Horário</TableCell>
              <TableCell>Atividade</TableCell>
              <TableCell>Responsável</TableCell>
              <TableCell>Sala</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule.slots.map((slot, index) => (
              <TableRow key={index}>
                <TableCell>
                  {slot.startTime} – {slot.endTime}
                </TableCell>
                <TableCell>{slot.name}</TableCell>
                <TableCell>{slot.responsible}</TableCell>
                <TableCell>{slot.room}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function ScheduleList({ campus }: { campus: Campus }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const query = useQuery({ queryKey: ["schedules"], queryFn: listSchedules });

  const weekEnd = addDays(weekStart, 6);

  const weekNav = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <IconButton onClick={() => setWeekStart((prev) => addDays(prev, -7))} aria-label="Semana anterior">
        <ChevronLeftIcon />
      </IconButton>
      <Typography>
        {weekDateFormatter.format(weekStart)} – {weekDateFormatter.format(weekEnd)}
      </Typography>
      <IconButton onClick={() => setWeekStart((prev) => addDays(prev, 7))} aria-label="Próxima semana">
        <ChevronRightIcon />
      </IconButton>
    </Box>
  );

  if (query.isLoading) {
    return (
      <Box>
        {weekNav}
        <Typography color="text.secondary">Carregando...</Typography>
      </Box>
    );
  }

  if (query.isError) {
    return (
      <Box>
        {weekNav}
        <Typography color="error">Não foi possível carregar os horários cadastrados.</Typography>
      </Box>
    );
  }

  const schedule = (query.data ?? []).find((s) => {
    if (s.campus !== campus) return false;
    const scheduleDate = new Date(s.date);
    return scheduleDate >= weekStart && scheduleDate <= weekEnd;
  });

  return (
    <Box>
      {weekNav}
      {schedule ? (
        <ScheduleTable schedule={schedule} />
      ) : (
        <Typography color="text.secondary">Nenhum horário cadastrado para esta semana.</Typography>
      )}
    </Box>
  );
}

export function Calendar() {
  const [tab, setTab] = useState<DriveSection>("fgv");
  const campus = SECTION_CAMPUS[tab];

  return (
    <Box sx={{ p: 4 }}>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        {(Object.keys(SECTION_LABELS) as DriveSection[]).map((section) => (
          <Tab key={section} label={SECTION_LABELS[section]} value={section} />
        ))}
      </Tabs>
      {tab === "anual" && (
        <Box sx={{ mt: 2 }}>
          <AnnualCalendar />
        </Box>
      )}
      {campus && (
        <Box sx={{ mt: 4 }}>
          <ScheduleList campus={campus} />
        </Box>
      )}
    </Box>
  );
}
