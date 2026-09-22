import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useSnackbar } from "notistack";
import { createAlertSchema, type CreateAlertInput } from "@elosmaster/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAlert, deleteAlert, updateAlert } from "../api/alerts";
import { useAuth } from "../auth/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

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

type AlertActionTarget = { id: number; message: string };

function EditAlertDialog({ alert, onClose }: { alert: AlertActionTarget | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateAlertInput>({
    resolver: zodResolver(createAlertSchema),
    values: { message: alert?.message ?? "" },
  });

  const mutation = useMutation({
    mutationFn: (input: CreateAlertInput) => updateAlert(alert!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      enqueueSnackbar("Alerta atualizado com sucesso", { variant: "success" });
      reset();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Não foi possível atualizar o alerta", { variant: "error" });
    },
  });

  return (
    <Dialog open={alert !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar alerta</DialogTitle>
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
            Salvar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function DeleteAlertDialog({ alert, onClose }: { alert: AlertActionTarget | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
      enqueueSnackbar("Alerta removido com sucesso", { variant: "success" });
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Não foi possível remover o alerta", { variant: "error" });
    },
  });

  return (
    <Dialog open={alert !== null} onClose={onClose}>
      <DialogTitle>Remover alerta</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja remover o alerta "{alert?.message}"? Esta ação não pode ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={() => alert && mutation.mutate(alert.id)}
          disabled={mutation.isPending}
        >
          Remover
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertToEdit, setAlertToEdit] = useState<AlertActionTarget | null>(null);
  const [alertToDelete, setAlertToDelete] = useState<AlertActionTarget | null>(null);

  const canCreateAlert = user?.role === "admin";

  return (
    <>
      <IconButton color="inherit" onClick={() => setOpen(true)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 360 }} role="presentation">
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
            <Typography variant="h6">Notificações</Typography>
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {canCreateAlert && (
            <Box sx={{ px: 2, pb: 1.5 }}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                sx={{ bgcolor: "#a83234 !important" }}
                onClick={() => setDialogOpen(true)}
              >
                Novo Alerta
              </Button>
            </Box>
          )}
          <Divider />
          {notifications.length === 0 && (
            <Typography sx={{ px: 2, py: 2 }} color="text.secondary">
              Nenhuma notificação
            </Typography>
          )}
          <List sx={{ overflowY: "auto" }}>
            {notifications.map((notification) => {
              const alertId = notification.type === "alert_created" ? Number(notification.payload.alertId) : NaN;
              const canManage =
                !Number.isNaN(alertId) && !!user && notification.payload.createdBy === user.id;
              const message = String(notification.payload.message ?? "");

              return (
                <ListItem
                  key={notification.id}
                  disablePadding
                  secondaryAction={
                    canManage && (
                      <>
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label="Editar"
                          onClick={() => setAlertToEdit({ id: alertId, message })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          size="small"
                          aria-label="Remover"
                          onClick={() => setAlertToDelete({ id: alertId, message })}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )
                  }
                >
                  <ListItemButton
                    onClick={() => !notification.read && markAsRead(notification.id)}
                    sx={{ bgcolor: notification.read ? "transparent" : "action.hover", pr: canManage ? 10 : 2 }}
                  >
                    <ListItemText primary={message} secondary={formatDateTime(notification.createdAt)} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      {canCreateAlert && <NewAlertDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
      <EditAlertDialog alert={alertToEdit} onClose={() => setAlertToEdit(null)} />
      <DeleteAlertDialog alert={alertToDelete} onClose={() => setAlertToDelete(null)} />
    </>
  );
}
