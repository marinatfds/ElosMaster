import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import type { Notification } from "@elosmaster/shared";
import { listNotifications, markNotificationRead } from "../api/notifications";
import { useAuth } from "../auth/AuthContext";

const NOTIFICATIONS_KEY = ["notifications"] as const;

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const notificationsQuery = useQuery({
    queryKey: NOTIFICATIONS_KEY,
    queryFn: listNotifications,
    enabled: !!user,
  });

  useEffect(() => {
    if (!user) return;

    const source = new EventSource(`${import.meta.env.VITE_API_URL}/notifications/stream`, {
      withCredentials: true,
    });

    source.addEventListener("notification", (event) => {
      const notification = JSON.parse((event as MessageEvent).data) as Notification;
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) => [
        notification,
        ...(current ?? []),
      ]);
      enqueueSnackbar(notification.payload.message as string, { variant: "info" });
    });

    return () => source.close();
  }, [user, queryClient, enqueueSnackbar]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: (updated) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_KEY, (current) =>
        current?.map((n) => (n.id === updated.id ? updated : n)),
      );
    },
  });

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead: markReadMutation.mutate,
  };
}
