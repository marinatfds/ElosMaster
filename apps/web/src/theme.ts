import { createTheme } from "@mui/material/styles";
import { ptBR } from "@mui/material/locale";

export const theme = createTheme(
  {
    palette: {
      primary: { main: "#a83234" },
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
  },
  ptBR,
);
