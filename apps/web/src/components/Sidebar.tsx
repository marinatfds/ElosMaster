import {
  Avatar,
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import HomeIcon from "@mui/icons-material/Home";
import SchoolIcon from "@mui/icons-material/School";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PersonIcon from "@mui/icons-material/Person";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import type { Role } from "@elosmaster/shared";
import { useAuth } from "../auth/AuthContext";
import { NotificationBell } from "./NotificationBell";
import logo from "../assets/logo.png";
import React from "react";

export const SIDEBAR_WIDTH = 240;

type NavItem = {
  to: string;
  label: string;
  icon: typeof HomeIcon;
  roles?: Role[];
};

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: HomeIcon },
  { to: "/alunos", label: "Alunos", icon: SchoolIcon, roles: ["admin", "coordinator"] },
  { to: "/simulados", label: "Simulados", icon: AssignmentIcon, roles: ["admin", "coordinator"] },
  { to: "/tesouraria", label: "Tesouraria", icon: AccountBalanceWalletIcon, roles: ["admin", "coordinator"] },
  { to: "/equipe", label: "Equipe", icon: GroupsIcon, roles: ["admin", "coordinator"] },
  { to: "/horarios", label: "Horários", icon: ScheduleIcon, roles: ["admin"] },
  { to: "/calendario", label: "Calendário", icon: CalendarMonthIcon, roles: ["admin"] },
  { to: "/nucleos", label: "Núcleos", icon: LocationCityIcon, roles: ["admin"] },
  { to: "/meu-aluno", label: "Meu Aluno", icon: PersonIcon, roles: ["volunteer"] },
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

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!user) return null;

  const visibleItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box
      component="nav"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fff",
        borderRight: "1px solid #e3e3e3",
      }}
    >
      <RouterLink to="/" style={{ display: "flex", justifyContent: "center", padding: "20px 16px" }}>
        <Box component="img" src={logo} alt="Elos Educação" sx={{ height: 56 }} />
      </RouterLink>

      <Box component="ul" sx={{ listStyle: "none", m: 0, p: 1, flexGrow: 1, overflowY: "auto" }}>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Box component="li" key={item.to}>
              <Box
                component={RouterLink}
                to={item.to}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: active ? "#a83234" : "#333",
                  bgcolor: active ? "#f5e3e3" : "transparent",
                  textDecoration: "none",
                  fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  mb: 0.5,
                  "&:hover": { bgcolor: active ? "#f5e3e3" : "#f0f0f0" },
                }}
              >
                <Icon fontSize="small" />
                {item.label}
              </Box>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 1, py: 1 }}>
        {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
          <IconButton
            key={label}
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            aria-label={label}
            sx={{ color: "#a83234" }}
          >
            <Icon fontSize="small" />
          </IconButton>
        ))}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #e3e3e3",
          px: 1.5,
          py: 1.5,
        }}
      >
        <Box
          onClick={handleClick}
          sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer", overflow: "hidden" }}
          aria-controls={open ? "user-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <Avatar sx={{ bgcolor: "#a83234", width: 32, height: 32 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Tooltip title={user.name}>
            <Typography noWrap sx={{ fontSize: 14, maxWidth: 110 }}>
              {user.name}
            </Typography>
          </Tooltip>
        </Box>
        <NotificationBell />
        <Menu id="user-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
          <MenuItem
            onClick={() => {
              handleClose();
              navigate("/configuracoes");
            }}
          >
            <ListItemIcon>
              <SettingsIcon fontSize="small" />
            </ListItemIcon>
            Configurações
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose();
              logout();
            }}
          >
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
}
