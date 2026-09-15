import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useLocation } from "react-router-dom";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { isAxiosError } from "axios";
import { loginSchema, type LoginInput } from "@elosmaster/shared";
import { useAuth } from "../auth/AuthContext";

export function Login() {
  const { user, login } = useAuth();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  if (user) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (input: LoginInput) => {
    setFormError(null);
    try {
      await login(input);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setFormError("E-mail ou senha inválidos");
      } else {
        setFormError("Não foi possível entrar. Tente novamente.");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <Paper component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 4, width: 360 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Entrar no ElosMaster
        </Typography>
        <TextField
          label="E-mail"
          fullWidth
          margin="normal"
          error={!!errors.email}
          helperText={errors.email?.message}
          {...register("email")}
        />
        <TextField
          label="Senha"
          type="password"
          fullWidth
          margin="normal"
          error={!!errors.password}
          helperText={errors.password?.message}
          {...register("password")}
        />
        {formError && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {formError}
          </Typography>
        )}
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={isSubmitting}>
          Entrar
        </Button>
      </Paper>
    </Box>
  );
}
