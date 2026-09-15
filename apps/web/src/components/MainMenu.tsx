import { Avatar, Box, Button, IconButton, Menu, MenuItem } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import type { Role } from "@elosmaster/shared";
import { useAuth } from "../auth/AuthContext";
import { NotificationBell } from "./NotificationBell";
import logo from "../assets/logo.png";
import React from "react";

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
  { to: "/horarios", label: "Horários", roles: ["admin", "treinador"] },
  { to: "/meu-aluno", label: "Meu Aluno", roles: ["aluno_responsavel"] },
];

const SOCIAL_LINKS = [
  { icon: FacebookIcon, href: "https://www.facebook.com/ElosEduca", label: "Facebook" },
  { icon: InstagramIcon, href: "https://www.instagram.com/eloseducacao/", label: "Instagram" },
  {
    icon: YouTubeIcon,
    href: "https://www.youtube.com/channel/UCC-t9-M_T_h3x5BtUNm4H7w",
    label: "YouTube",
  },
];

export function MainMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const visibleItems = MENU_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box>
      <Box
        sx={{
          height: 104,
          px: 3,
          boxSizing: "border-box",
          bgcolor: "#e3e3e3",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <RouterLink to="/" style={{ display: "flex" }}>
          <Box component="img" src={logo} alt="Elos Educação" sx={{ height: 68 }} />
        </RouterLink>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <NotificationBell />
          <IconButton
            onClick={handleClick}
            size="small"
            aria-controls={open ? "user-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
          >
            <Avatar sx={{ bgcolor: "#a83234", width: 32, height: 32 }}>
              {user.name.charAt(0).toUpperCase()}
            </Avatar>
          </IconButton>
          <Menu id="user-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem
              onClick={() => {
                handleClose();
                logout();
              }}
            >
              Sair
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          minHeight: 48,
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#a83234",
          px: 1,
        }}
      >
        <Box sx={{ display: "flex", flexWrap: "wrap" }}>
          {visibleItems.map((item) => (
            <Box
              key={item.to}
              component={RouterLink}
              to={item.to}
              sx={{
                color: "#fff",
                textDecoration: "none",
                fontSize: 15,
                px: "15px",
                py: "15px",
                "&:hover": { bgcolor: "#e3e3e3", color: "#a83234" },
              }}
            >
              {item.label}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
            <IconButton
              key={label}
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              aria-label={label}
              sx={{ color: "#fff" }}
            >
              <Icon fontSize="small" />
            </IconButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
