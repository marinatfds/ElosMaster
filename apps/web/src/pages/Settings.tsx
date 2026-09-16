import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useSnackbar } from "notistack";
import { isAxiosError } from "axios";
import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@elosmaster/shared";
import { ME_QUERY_KEY, useAuth } from "../auth/AuthContext";
import { changePassword, updateProfile } from "../api/auth";

export function Settings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: "", email: "" },
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, email: user.email });
    }
  }, [user, profileForm]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(ME_QUERY_KEY, updatedUser);
      enqueueSnackbar("Perfil atualizado com sucesso", { variant: "success" });
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        profileForm.setError("email", { message: "E-mail já está em uso" });
        return;
      }
      enqueueSnackbar("Não foi possível atualizar o perfil", { variant: "error" });
    },
  });

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      passwordForm.reset();
      enqueueSnackbar("Senha alterada com sucesso", { variant: "success" });
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 401) {
        passwordForm.setError("currentPassword", { message: "Senha atual incorreta" });
        return;
      }
      enqueueSnackbar("Não foi possível alterar a senha", { variant: "error" });
    },
  });

  if (!user) return null;

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
      <Typography variant="h5">Configurações</Typography>

      <Paper
        component="form"
        onSubmit={profileForm.handleSubmit((input) => profileMutation.mutate(input))}
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6">Perfil</Typography>

        <TextField
          label="Nome"
          error={!!profileForm.formState.errors.name}
          helperText={profileForm.formState.errors.name?.message}
          {...profileForm.register("name")}
        />

        <TextField
          label="E-mail"
          error={!!profileForm.formState.errors.email}
          helperText={profileForm.formState.errors.email?.message}
          {...profileForm.register("email")}
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={profileForm.formState.isSubmitting}
          sx={{ alignSelf: "flex-start" }}
        >
          Salvar
        </Button>
      </Paper>

      <Paper
        component="form"
        onSubmit={passwordForm.handleSubmit((input) => passwordMutation.mutate(input))}
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Typography variant="h6">Alterar senha</Typography>

        <TextField
          label="Senha atual"
          type="password"
          error={!!passwordForm.formState.errors.currentPassword}
          helperText={passwordForm.formState.errors.currentPassword?.message}
          {...passwordForm.register("currentPassword")}
        />

        <TextField
          label="Nova senha"
          type="password"
          error={!!passwordForm.formState.errors.newPassword}
          helperText={passwordForm.formState.errors.newPassword?.message}
          {...passwordForm.register("newPassword")}
        />

        <TextField
          label="Confirmar nova senha"
          type="password"
          error={!!passwordForm.formState.errors.confirmPassword}
          helperText={passwordForm.formState.errors.confirmPassword?.message}
          {...passwordForm.register("confirmPassword")}
        />

        <Button
          type="submit"
          variant="contained"
          startIcon={<LockResetIcon />}
          disabled={passwordForm.formState.isSubmitting}
          sx={{ alignSelf: "flex-start" }}
        >
          Alterar senha
        </Button>
      </Paper>
    </Box>
  );
}
