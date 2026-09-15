import { Box, Typography } from "@mui/material";

export function NotAuthorized() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Acesso não autorizado</Typography>
      <Typography color="text.secondary">
        Seu usuário não tem permissão para ver esta página.
      </Typography>
    </Box>
  );
}
