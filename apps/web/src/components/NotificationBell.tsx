import { useState } from "react";
import {
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../hooks/useNotifications";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

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
    </>
  );
}
