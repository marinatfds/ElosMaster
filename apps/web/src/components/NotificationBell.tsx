import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useSnackbar } from "notistack";
import { createAlertSchema, type CreateAlertInput } from "@elosmaster/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAlert } from "../api/alerts";
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

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

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
            {notifications.map((notification) => (
              <ListItemButton
                key={notification.id}
                onClick={() => !notification.read && markAsRead(notification.id)}
                sx={{ bgcolor: notification.read ? "transparent" : "action.hover" }}
              >
                <ListItemText
                  primary={String(notification.payload.message ?? "")}
                  secondary={formatDateTime(notification.createdAt)}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      </Drawer>
      {canCreateAlert && <NewAlertDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />}
    </>
  );
}
