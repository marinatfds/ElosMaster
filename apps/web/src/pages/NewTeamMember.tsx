import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, MenuItem, Paper, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import {
  createTeamMemberSchema,
  type CreateTeamMemberInput,
} from "@elosmaster/shared";
import { createTeamMember } from "../api/team";
import { listTeamPositions } from "../api/team-positions";
import { useCampuses } from "../hooks/useCampuses";

export function NewTeamMember() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const positionsQuery = useQuery({ queryKey: ["team-positions"], queryFn: listTeamPositions });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateTeamMemberInput>({
    resolver: zodResolver(createTeamMemberSchema),
    defaultValues: { campus: "", position: "" },
  });

  const { names: campusNames } = useCampuses();
  const selectedCampus = useWatch({ control, name: "campus" });
  useEffect(() => {
    if (!selectedCampus && campusNames.length > 0) {
      setValue("campus", campusNames[0]);
    }
  }, [selectedCampus, campusNames, setValue]);

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
              {(positionsQuery.data ?? []).map((position) => (
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
    </Box>
  );
}
