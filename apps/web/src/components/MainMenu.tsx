import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import type { Role } from "@elosmaster/shared";
import { useAuth } from "../auth/AuthContext";
import { NotificationBell } from "./NotificationBell";

type MenuItem = {
  to: string;
  label: string;
  roles?: Role[];
};

const MENU_ITEMS: MenuItem[] = [
  { to: "/", label: "Início" },
  { to: "/calendario", label: "Calendário" },
  { to: "/alunos", label: "Alunos", roles: ["admin", "treinador"] },
  { to: "/equipe", label: "Equipe", roles: ["admin", "treinador"] },
  { to: "/simulados", label: "Simulados", roles: ["admin", "treinador"] },
  { to: "/tesouraria", label: "Tesouraria", roles: ["admin", "treinador"] },
  { to: "/meu-aluno", label: "Meu Aluno", roles: ["aluno_responsavel"] },
];

export function MainMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleItems = MENU_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 0, mr: 2 }}>
          ElosMaster
        </Typography>
        <Box sx={{ flexGrow: 1, display: "flex", gap: 1 }}>
          {visibleItems.map((item) => (
            <Button key={item.to} component={RouterLink} to={item.to} color="inherit">
              {item.label}
            </Button>
          ))}
        </Box>
        <NotificationBell />
        <Typography variant="body2">{user.name}</Typography>
        <Button color="inherit" onClick={() => logout()}>
          Sair
        </Button>
      </Toolbar>
    </AppBar>
  );
}
