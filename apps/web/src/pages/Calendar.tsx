import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { Box, Link, List, ListItem, ListItemIcon, ListItemText, Tab, Tabs, Typography } from "@mui/material";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import type { DriveSection } from "@elosmaster/shared";
import { listDriveFiles } from "../api/drive";

const SECTION_LABELS: Record<DriveSection, string> = {
  fgv: "Horário FGV",
  puc: "Horário PUC",
  anual: "Calendário Anual",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });

function DriveFileList({ section }: { section: DriveSection }) {
  const query = useQuery({ queryKey: ["drive", section], queryFn: () => listDriveFiles(section), retry: false });

  if (query.isLoading) {
    return <Typography color="text.secondary">Carregando...</Typography>;
  }

  if (query.isError) {
    const notConfigured = isAxiosError(query.error) && query.error.response?.status === 503;
    return (
      <Typography color="text.secondary">
        {notConfigured
          ? "A integração com o Google Drive ainda não foi configurada."
          : "Não foi possível carregar os documentos do Google Drive."}
      </Typography>
    );
  }

  if (query.data?.length === 0) {
    return <Typography color="text.secondary">Nenhum documento nesta pasta ainda.</Typography>;
  }

  return (
    <List>
      {query.data?.map((file) => (
        <ListItem key={file.id}>
          <ListItemIcon>
            <InsertDriveFileIcon />
          </ListItemIcon>
          <ListItemText
            primary={
              file.webViewLink ? (
                <Link href={file.webViewLink} target="_blank" rel="noopener">
                  {file.name}
                </Link>
              ) : (
                file.name
              )
            }
            secondary={file.modifiedTime ? `Atualizado em ${dateFormatter.format(new Date(file.modifiedTime))}` : undefined}
          />
        </ListItem>
      ))}
    </List>
  );
}

export function Calendar() {
  const [tab, setTab] = useState<DriveSection>("fgv");

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Calendário
      </Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        {(Object.keys(SECTION_LABELS) as DriveSection[]).map((section) => (
          <Tab key={section} label={SECTION_LABELS[section]} value={section} />
        ))}
      </Tabs>
      <Box sx={{ mt: 2 }}>
        <DriveFileList section={tab} />
      </Box>
    </Box>
  );
}
