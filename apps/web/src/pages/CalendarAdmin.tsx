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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useSnackbar } from "notistack";
import {
  updateCalendarSettingsSchema,
  type CalendarSettings,
  type UpdateCalendarSettingsInput,
} from "@elosmaster/shared";
import {
  createCancelledClass,
  createExtraClass,
  deleteCancelledClass,
  deleteExtraClass,
  getAnnualCalendar,
  updateAulaWeekdays,
  updateCalendarSettings,
} from "../api/calendar";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeZone: "UTC" });

function formatDate(iso: string) {
  return dateFormatter.format(new Date(`${iso}T00:00:00Z`));
}

// Valores seguem Date.getDay() (0 = domingo); a ordem exibida começa na segunda.
const WEEKDAY_OPTIONS = [
  { value: 1, short: "Seg", label: "Segunda-feira" },
  { value: 2, short: "Ter", label: "Terça-feira" },
  { value: 3, short: "Qua", label: "Quarta-feira" },
  { value: 4, short: "Qui", label: "Quinta-feira" },
  { value: 5, short: "Sex", label: "Sexta-feira" },
  { value: 6, short: "Sáb", label: "Sábado" },
  { value: 0, short: "Dom", label: "Domingo" },
];

function DiasFuncionamentoForm({ weekdays }: { weekdays: number[] }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [selected, setSelected] = useState(weekdays);

  const mutation = useMutation({
    mutationFn: updateAulaWeekdays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      enqueueSnackbar("Dias de funcionamento atualizados", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível salvar os dias de funcionamento", { variant: "error" }),
  });

  return (
    <Paper
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ aulaWeekdays: selected });
      }}
      sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
    >
      <Typography variant="h6">Dias de funcionamento</Typography>
      <Typography variant="body2" color="text.secondary">
        Selecione os dias da semana em que a escola funciona. Apenas esses dias serão marcados como aulas.
      </Typography>
      <ToggleButtonGroup
        color="primary"
        value={selected}
        onChange={(_, days: number[]) => setSelected(days)}
        aria-label="Dias de funcionamento"
        sx={{ flexWrap: "wrap" }}
      >
        {WEEKDAY_OPTIONS.map((day) => (
          <ToggleButton key={day.value} value={day.value} aria-label={day.label} sx={{ px: 2 }}>
            {day.short}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {selected.length === 0 && (
        <Typography variant="caption" color="error">
          Selecione ao menos um dia de funcionamento.
        </Typography>
      )}
      <Box>
        <Button type="submit" variant="contained" disabled={selected.length === 0 || mutation.isPending}>
          Salvar
        </Button>
      </Box>
    </Paper>
  );
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
        Todos os dias de funcionamento entre as datas abaixo serão marcados como aulas no calendário anual.
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

type DateListItem = { id: number; date: string };

type DateListCardProps = {
  title: string;
  description?: string;
  emptyMessage: string;
  addedMessage: string;
  addErrorMessage: string;
  removedMessage: string;
  removeErrorMessage: string;
  removeAriaLabel: string;
  items: DateListItem[];
  onAdd: (date: string) => Promise<unknown>;
  onRemove: (id: number) => Promise<unknown>;
};

function DateListCard({
  title,
  description,
  emptyMessage,
  addedMessage,
  addErrorMessage,
  removedMessage,
  removeErrorMessage,
  removeAriaLabel,
  items,
  onAdd,
  onRemove,
}: DateListCardProps) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [newDate, setNewDate] = useState("");

  const addMutation = useMutation({
    mutationFn: onAdd,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      setNewDate("");
      enqueueSnackbar(addedMessage, { variant: "success" });
    },
    onError: () => enqueueSnackbar(addErrorMessage, { variant: "error" }),
  });

  const removeMutation = useMutation({
    mutationFn: onRemove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      enqueueSnackbar(removedMessage, { variant: "success" });
    },
    onError: () => enqueueSnackbar(removeErrorMessage, { variant: "error" }),
  });

  return (
    <Paper sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h6">{title}</Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
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
          onClick={() => addMutation.mutate(newDate)}
        >
          Adicionar
        </Button>
      </Box>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          {emptyMessage}
        </Typography>
      ) : (
        <List dense>
          {items.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                <IconButton edge="end" aria-label={removeAriaLabel} onClick={() => removeMutation.mutate(item.id)}>
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

function AulasExtrasList({ extraClasses }: { extraClasses: DateListItem[] }) {
  return (
    <DateListCard
      title="Aulas extras"
      emptyMessage="Nenhuma aula extra cadastrada."
      addedMessage="Aula extra adicionada"
      addErrorMessage="Não foi possível adicionar a aula extra"
      removedMessage="Aula extra removida"
      removeErrorMessage="Não foi possível remover a aula extra"
      removeAriaLabel="Remover aula extra"
      items={extraClasses}
      onAdd={(date) => createExtraClass({ date })}
      onRemove={deleteExtraClass}
    />
  );
}

function AulasCanceladasList({ cancelledClasses }: { cancelledClasses: DateListItem[] }) {
  return (
    <DateListCard
      title="Aulas canceladas"
      description="As datas abaixo deixam de ser marcadas como aula no calendário anual."
      emptyMessage="Nenhuma aula cancelada cadastrada."
      addedMessage="Aula cancelada adicionada"
      addErrorMessage="Não foi possível adicionar a aula cancelada"
      removedMessage="Aula cancelada removida"
      removeErrorMessage="Não foi possível remover a aula cancelada"
      removeAriaLabel="Remover aula cancelada"
      items={cancelledClasses}
      onAdd={(date) => createCancelledClass({ date })}
      onRemove={deleteCancelledClass}
    />
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
          <DiasFuncionamentoForm
            key={query.data.settings.aulaWeekdays.join(",")}
            weekdays={query.data.settings.aulaWeekdays}
          />
          <AulasForm key={`${query.data.settings.aulaStart}-${query.data.settings.aulaEnd}`} settings={query.data.settings} />
          <AulasExtrasList extraClasses={query.data.extraClasses} />
          <AulasCanceladasList cancelledClasses={query.data.cancelledClasses} />
          <SimuladosPreview examDates={query.data.examDates} />
          <FeriadosPreview holidays={query.data.holidays} />
        </>
      )}
    </Box>
  );
}
