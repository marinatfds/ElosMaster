import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import {
  updateCalendarSettingsSchema,
  type CalendarSettings,
  type CreateExtraClassInput,
  type UpdateCalendarSettingsInput,
} from "@elosmaster/shared";
import { createExtraClass, deleteExtraClass, getAnnualCalendar, updateCalendarSettings } from "../api/calendar";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

function AulasForm({ settings }: { settings: CalendarSettings }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCalendarSettingsInput>({
    resolver: zodResolver(updateCalendarSettingsSchema),
    defaultValues: {
      aulaStart: settings.aulaStart ?? "",
      aulaEnd: settings.aulaEnd ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: updateCalendarSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      enqueueSnackbar("Período de aulas atualizado", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível salvar o período de aulas", { variant: "error" }),
  });

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit((input) => mutation.mutate(input))}
      sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h6">Aulas</Typography>
      <Typography variant="body2" color="text.secondary">
        Todos os sábados entre as datas abaixo serão marcados como aulas no calendário anual.
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          label="De"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.aulaStart}
          helperText={errors.aulaStart?.message}
          {...register("aulaStart")}
        />
        <TextField
          label="Até"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.aulaEnd}
          helperText={errors.aulaEnd?.message}
          {...register("aulaEnd")}
        />
      </Box>
      <Box>
        <Button type="submit" variant="contained" disabled={isSubmitting}>
          Salvar
        </Button>
      </Box>
    </Paper>
  );
}

function AulasExtrasList({ extraClasses }: { extraClasses: { id: number; date: string }[] }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [newDate, setNewDate] = useState("");

  const addMutation = useMutation({
    mutationFn: (input: CreateExtraClassInput) => createExtraClass(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setNewDate("");
      enqueueSnackbar("Aula extra adicionada", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível adicionar a aula extra", { variant: "error" }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => deleteExtraClass(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      enqueueSnackbar("Aula extra removida", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível remover a aula extra", { variant: "error" }),
  });

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Aulas extras</Typography>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Data"
          type="date"
          size="small"
          slotProps={{ inputLabel: { shrink: true } }}
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
        />
        <Button
          variant="outlined"
          disabled={!newDate || addMutation.isPending}
          onClick={() => addMutation.mutate({ date: newDate })}
        >
          Adicionar
        </Button>
      </Box>
      {extraClasses.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhuma aula extra cadastrada.
        </Typography>
      ) : (
        <List dense>
          {extraClasses.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="Remover aula extra"
                  onClick={() => removeMutation.mutate(item.id)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <ListItemText primary={formatDate(item.date)} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

function SimuladosPreview({ examDates }: { examDates: string[] }) {
  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Simulados</Typography>
      <Typography variant="body2" color="text.secondary">
        As datas de simulados são gerenciadas na tela{" "}
        <Link component={RouterLink} to="/simulados">
          Simulados
        </Link>{" "}
        e refletem automaticamente aqui.
      </Typography>
      {examDates.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum simulado cadastrado.
        </Typography>
      ) : (
        <List dense>
          {examDates.map((date) => (
            <ListItem key={date}>
              <ListItemText primary={formatDate(date)} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

function FeriadosPreview({ holidays }: { holidays: { date: string; name: string }[] }) {
  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">Feriados</Typography>
      <Typography variant="body2" color="text.secondary">
        Feriados nacionais são obtidos automaticamente para o período de aulas configurado.
      </Typography>
      {holidays.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum feriado no período configurado.
        </Typography>
      ) : (
        <List dense>
          {holidays.map((holiday) => (
            <ListItem key={holiday.date}>
              <ListItemText primary={holiday.name} secondary={formatDate(holiday.date)} />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
}

export function CalendarAdmin() {
  const query = useQuery({ queryKey: ["calendar"], queryFn: getAnnualCalendar });

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", gap: 3, maxWidth: 720 }}>
      <Typography variant="h5">Calendário</Typography>

      {query.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {query.isError && <Typography color="error">Não foi possível carregar o calendário.</Typography>}

      {query.data && (
        <>
          <AulasForm key={`${query.data.settings.aulaStart}-${query.data.settings.aulaEnd}`} settings={query.data.settings} />
          <AulasExtrasList extraClasses={query.data.extraClasses} />
          <SimuladosPreview examDates={query.data.examDates} />
          <FeriadosPreview holidays={query.data.holidays} />
        </>
      )}
    </Box>
  );
}
