import { Box, Typography } from "@mui/material";

export function PagePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary">Implementação prevista para: {phase}.</Typography>
    </Box>
  );
}
