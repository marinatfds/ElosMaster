import { useState } from "react";
import {
  Badge,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  Typography,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../hooks/useNotifications";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR");
}

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton color="inherit" onClick={(e) => setAnchorEl(e.currentTarget)}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {notifications.length === 0 && (
          <Typography sx={{ px: 2, py: 1 }} color="text.secondary">
            Nenhuma notificação
          </Typography>
        )}
        <List sx={{ minWidth: 320, maxHeight: 400, overflowY: "auto" }}>
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
      </Menu>
    </>
  );
}
