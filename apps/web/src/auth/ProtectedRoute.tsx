import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "@elosmaster/shared";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/nao-autorizado" replace />;
  }

  return <Outlet />;
}
