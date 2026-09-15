import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { createAlertSchema, type CreateAlertInput } from "@elosmaster/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAlert, listAlerts } from "../api/alerts";
import { useAuth } from "../auth/AuthContext";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

function NewAlertDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAlertInput>({ resolver: zodResolver(createAlertSchema) });

  const mutation = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      enqueueSnackbar("Alerta criado com sucesso", { variant: "success" });
      reset();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Não foi possível criar o alerta", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo alerta</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((input) => mutation.mutate(input))}>
        <DialogContent>
          <TextField
            label="Mensagem"
            fullWidth
            multiline
            minRows={3}
            error={!!errors.message}
            helperText={errors.message?.message}
            {...register("message")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Criar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function Home() {
  const { user } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const alertsQuery = useQuery({ queryKey: ["alerts"], queryFn: listAlerts });

  const canCreateAlert = user?.role === "admin" || user?.role === "treinador";

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap" }}>
      <Box sx={{ width: { xs: "100%", sm: "30%" }, bgcolor: "#e3e3e3", p: "20px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Últimas notícias:
          {canCreateAlert && (
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: "#a83234 !important" }}
              onClick={() => setDialogOpen(true)}
            >
              Novo Alerta
            </Button>
          )}
        </Box>

        {alertsQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
        {alertsQuery.isError && <Typography color="error">Não foi possível carregar os alertas.</Typography>}
        {alertsQuery.data?.length === 0 && (
          <Typography color="text.secondary">Nenhum alerta publicado ainda.</Typography>
        )}

        <List>
          {alertsQuery.data?.map((alert) => (
            <ListItem key={alert.id} alignItems="flex-start">
              <ListItemAvatar>
                <Avatar>{alert.message.charAt(0).toUpperCase()}</Avatar>
              </ListItemAvatar>
              <ListItemText primary={formatDateTime(alert.createdAt)} secondary={alert.message} />
            </ListItem>
          ))}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1, bgcolor: "#fff", p: "20px" }}>
        <Typography component="i">"Nenhum de nós é tão bom quanto todos nós juntos!"</Typography>
      </Box>

      <NewAlertDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
