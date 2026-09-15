import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import {
  CAMPUSES,
  TEAM_POSITIONS,
  createTeamMemberSchema,
  type CreateTeamMemberInput,
} from "@elosmaster/shared";
import { createTeamMember } from "../api/team";

export function NewTeamMember() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamMemberInput>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: { campus: CAMPUSES[0], position: TEAM_POSITIONS[0] },
  });

  const mutation = useMutation({
    mutationFn: createTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      enqueueSnackbar("Membro cadastrado com sucesso", { variant: "success" });
      navigate("/equipe");
    },
    onError: () => {
      enqueueSnackbar("Não foi possível cadastrar o membro", { variant: "error" });
    },
  });

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Novo Membro da Equipe
      </Typography>
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
              {CAMPUSES.map((campus) => (
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
            <TextField {...field} select label="Cargo" error={!!errors.position}>
              {TEAM_POSITIONS.map((position) => (
                <MenuItem key={position} value={position}>
                  {position}
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
    </Box>
  );
}
