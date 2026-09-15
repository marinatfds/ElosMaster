import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { CAMPUSES } from "@elosmaster/shared";
import { createSchedule } from "../api/schedules";
import { ScheduleForm, createEmptySlot } from "../components/ScheduleForm";

export function NewSchedule() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: createSchedule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      enqueueSnackbar("Horário registrado com sucesso", { variant: "success" });
      navigate("/horarios");
    },
    onError: () => {
      enqueueSnackbar("Não foi possível registrar o horário", { variant: "error" });
    },
  });

  return (
    <ScheduleForm
      title="Novo Horário"
      submitLabel="Salvar"
      isSubmitting={mutation.isPending}
      initialValues={{ campus: CAMPUSES[0], date: "", slots: [createEmptySlot()] }}
      onSubmit={(input) => mutation.mutate(input)}
    />
  );
}
