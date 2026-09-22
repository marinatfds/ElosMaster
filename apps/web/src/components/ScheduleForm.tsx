import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "react-router-dom";
import { Autocomplete, Box, Button, IconButton, MenuItem, Paper, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import {
  SCHEDULE_ACTIVITIES,
  computeSlotTime,
  createScheduleSchema,
  type CreateScheduleInput,
  type Schedule,
} from "@elosmaster/shared";
import { listSchedules } from "../api/schedules";
import { listTeamMembers } from "../api/team";
import { useCampuses } from "../hooks/useCampuses";

const TOTAL_SLOTS = SCHEDULE_ACTIVITIES.length;

type ScheduleSlotInput = CreateScheduleInput["slots"][number];

export function createEmptySlot(): ScheduleSlotInput {
  return { name: "" as ScheduleSlotInput["name"], startTime: "", endTime: "", responsible: "", room: "" };
}

type ScheduleFormProps = {
  title: string;
  submitLabel: string;
  initialValues: CreateScheduleInput;
  isSubmitting: boolean;
  onSubmit: (input: CreateScheduleInput) => void;
  allowCopyLast?: boolean;
};

export function ScheduleForm({
  title,
  submitLabel,
  initialValues,
  isSubmitting,
  onSubmit,
  allowCopyLast = false,
}: ScheduleFormProps) {
  const teamQuery = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });
  const teamMembers = teamQuery.data ?? [];

  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: listSchedules, enabled: allowCopyLast });
  const lastSchedule = schedulesQuery.data?.reduce<Schedule | undefined>(
    (latest, current) => (!latest || current.id > latest.id ? current : latest),
    undefined,
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<CreateScheduleInput>({
    resolver: zodResolver(createScheduleSchema),
    defaultValues: initialValues,
  });

  const { fields, append, remove, replace } = useFieldArray({ control, name: "slots" });

  const campus = watch("campus");
  const slots = watch("slots");

  const { names: campusNames } = useCampuses();
  // Formulário novo começa sem núcleo: assume o primeiro cadastrado assim que a lista carrega.
  useEffect(() => {
    if (!campus && campusNames.length > 0) {
      setValue("campus", campusNames[0]);
    }
  }, [campus, campusNames, setValue]);

  const usedActivityNames = new Set(slots.map((slot) => slot?.name).filter(Boolean));
  const isComplete =
    fields.length === TOTAL_SLOTS && slots.every((slot) => slot?.name && slot?.responsible && slot?.room);

  const teamOptions = teamMembers
    .filter((member) => !campus || member.campus === campus)
    .map((member) => member.name);

  function recomputeTimes(currentSlots: ScheduleSlotInput[]) {
    let previousEndTime: string | undefined;
    currentSlots.forEach((slot, index) => {
      if (!slot?.name) return;
      const { startTime, endTime } = computeSlotTime(previousEndTime, slot.name);
      setValue(`slots.${index}.startTime`, startTime);
      setValue(`slots.${index}.endTime`, endTime);
      previousEndTime = endTime;
    });
  }

  function handleActivityChange(index: number, activityName: string) {
    setValue(`slots.${index}.name`, activityName as ScheduleSlotInput["name"], { shouldValidate: true });
    recomputeTimes(getValues("slots"));
  }

  // Copia os horários do último cadastro; o núcleo e a data escolhidos no formulário são mantidos.
  function handleCopyLast() {
    if (!lastSchedule) return;
    replace(lastSchedule.slots.map((slot) => ({ ...slot })));
  }

  function handleAddSlot() {
    if (fields.length >= TOTAL_SLOTS) return;
    append(createEmptySlot());
  }

  function handleRemoveSlot(index: number) {
    remove(index);
    recomputeTimes(getValues("slots"));
  }

  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Paper
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Controller
          name="campus"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Campus" error={!!errors.campus}>
              {campusNames.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Data"
              type="date"
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.date}
              helperText={errors.date?.message}
            />
          )}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mt: 1 }}>
          <Typography variant="subtitle1">
            Horários ({fields.length}/{TOTAL_SLOTS})
          </Typography>
          {allowCopyLast && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={handleCopyLast}
              disabled={!lastSchedule}
            >
              Copiar último horário cadastrado
            </Button>
          )}
        </Box>

        {fields.map((field, index) => {
          const slot = slots[index];
          return (
            <Box
              key={field.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" color="text.secondary">
                  {slot?.startTime && slot?.endTime ? `${slot.startTime} – ${slot.endTime}` : "Selecione a atividade"}
                </Typography>
                <IconButton size="small" onClick={() => handleRemoveSlot(index)} aria-label="Remover horário">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <Controller
                  name={`slots.${index}.name`}
                  control={control}
                  render={({ field: nameField }) => (
                    <TextField
                      {...nameField}
                      select
                      label="Atividade"
                      sx={{ flex: 1, minWidth: 220 }}
                      error={!!errors.slots?.[index]?.name}
                      helperText={errors.slots?.[index]?.name?.message}
                      onChange={(e) => handleActivityChange(index, e.target.value)}
                    >
                      {SCHEDULE_ACTIVITIES.filter(
                        (activity) => activity.name === nameField.value || !usedActivityNames.has(activity.name),
                      ).map((activity) => (
                        <MenuItem key={activity.name} value={activity.name}>
                          {activity.name} ({activity.durationMinutes} min)
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />

                <Controller
                  name={`slots.${index}.responsible`}
                  control={control}
                  render={({ field: responsibleField }) => (
                    <Autocomplete
                      freeSolo
                      options={teamOptions}
                      value={responsibleField.value ?? ""}
                      onChange={(_, newValue) => responsibleField.onChange(newValue ?? "")}
                      onInputChange={(_, newInputValue, reason) => {
                        if (reason === "input") responsibleField.onChange(newInputValue);
                      }}
                      sx={{ flex: 1, minWidth: 200 }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Responsável"
                          error={!!errors.slots?.[index]?.responsible}
                          helperText={errors.slots?.[index]?.responsible?.message}
                        />
                      )}
                    />
                  )}
                />

                <TextField
                  label="Sala"
                  sx={{ flex: 1, minWidth: 160 }}
                  error={!!errors.slots?.[index]?.room}
                  helperText={errors.slots?.[index]?.room?.message}
                  {...register(`slots.${index}.room`)}
                />
              </Box>
            </Box>
          );
        })}

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddSlot}
          disabled={fields.length >= TOTAL_SLOTS}
        >
          Adicionar horário
        </Button>

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/horarios"
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting || !isComplete}
            sx={{ flex: 1 }}
          >
            {submitLabel}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
