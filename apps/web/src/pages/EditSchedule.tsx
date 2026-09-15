import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import type { UpdateScheduleInput } from "@elosmaster/shared";
import { getSchedule, updateSchedule } from "../api/schedules";
import { ScheduleForm } from "../components/ScheduleForm";

export function EditSchedule() {
  const { id } = useParams();
  const scheduleId = Number(id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const scheduleQuery = useQuery({
    queryKey: ["schedules", scheduleId],
    queryFn: () => getSchedule(scheduleId),
    enabled: Number.isInteger(scheduleId),
  });

  const mutation = useMutation({
    mutationFn: (input: UpdateScheduleInput) => updateSchedule(scheduleId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      enqueueSnackbar("Horário atualizado com sucesso", { variant: "success" });
      navigate("/horarios");
    },
    onError: () => {
      enqueueSnackbar("Não foi possível atualizar o horário", { variant: "error" });
    },
  });

  return (
    <Box>
      {scheduleQuery.isLoading && (
        <Box sx={{ p: 4 }}>
          <Typography color="text.secondary">Carregando...</Typography>
        </Box>
      )}
      {scheduleQuery.isError && (
        <Box sx={{ p: 4 }}>
          <Typography color="error">Não foi possível carregar o horário.</Typography>
        </Box>
      )}
      {scheduleQuery.data && (
        <ScheduleForm
          title="Editar Horário"
          submitLabel="Salvar"
          isSubmitting={mutation.isPending}
          initialValues={scheduleQuery.data}
          onSubmit={(input) => mutation.mutate(input)}
        />
      )}
    </Box>
  );
}
