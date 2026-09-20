import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import {
  updateTeamMemberSchema,
  type UpdateTeamMemberInput,
} from "@elosmaster/shared";
import { getTeamMember, updateTeamMember } from "../api/team";
import { listTeamPositions } from "../api/team-positions";
import { useCampuses } from "../hooks/useCampuses";

export function EditTeamMember() {
  const { id } = useParams();
  const memberId = Number(id);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const memberQuery = useQuery({
    queryKey: ["team", memberId],
    queryFn: () => getTeamMember(memberId),
    enabled: Number.isInteger(memberId),
  });
  const positionsQuery = useQuery({ queryKey: ["team-positions"], queryFn: listTeamPositions });
  const { names: campusNames } = useCampuses();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateTeamMemberInput>({
    resolver: zodResolver(updateTeamMemberSchema),
    defaultValues: { campus: "", position: "" },
  });

  useEffect(() => {
    if (memberQuery.data) {
      reset(memberQuery.data);
    }
  }, [memberQuery.data, reset]);

  const mutation = useMutation({
    mutationFn: (input: UpdateTeamMemberInput) => updateTeamMember(memberId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      enqueueSnackbar("Membro atualizado com sucesso", { variant: "success" });
      navigate("/equipe");
    },
    onError: () => {
      enqueueSnackbar("Não foi possível atualizar o membro", { variant: "error" });
    },
  });

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Editar Membro da Equipe
      </Typography>

      {memberQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {memberQuery.isError && <Typography color="error">Não foi possível carregar o membro.</Typography>}

      {memberQuery.data && positionsQuery.data && (
        <Paper
          component="form"
          onSubmit={handleSubmit((input) => mutation.mutate(input))}
          sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Nome"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />

          <Controller
            name="campus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Núcleo" error={!!errors.campus}>
                {campusNames.map((campus) => (
                  <MenuItem key={campus} value={campus}>
                    {campus}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <Controller
            name="position"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                label="Cargo"
                error={!!errors.position}
                helperText={errors.position?.message}
              >
                {positionsQuery.data.map((position) => (
                  <MenuItem key={position.id} value={position.name}>
                    {position.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />

          <TextField
            label="E-mail"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email")}
          />

          <TextField
            label="Celular"
            error={!!errors.phone}
            helperText={errors.phone?.message}
            {...register("phone")}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant="outlined"
              component={RouterLink}
              to="/equipe"
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            >
              Voltar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={isSubmitting}
              sx={{ flex: 1 }}
            >
              Salvar
            </Button>
          </Box>
        </Paper>
      )}
    </Box>
  );
}
