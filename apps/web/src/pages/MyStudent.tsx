import { useQuery } from "@tanstack/react-query";
import { Box, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useAuth } from "../auth/AuthContext";
import { getStudentGrades } from "../api/exams";
import { getStudentPresence } from "../api/presence";
import { getBoletimUrl } from "../api/reports";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });
const periodLabels: Record<string, string> = { morning: "Manhã", afternoon: "Tarde" };

export function MyStudent() {
  const { user } = useAuth();
  const studentId = user?.studentId ?? null;

  const gradesQuery = useQuery({
    queryKey: ["student-grades", studentId],
    queryFn: () => getStudentGrades(studentId!),
    enabled: studentId !== null,
  });

  const presenceQuery = useQuery({
    queryKey: ["student-presence", studentId],
    queryFn: () => getStudentPresence(studentId!),
    enabled: studentId !== null,
  });

  if (studentId === null) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">
          Seu usuário ainda não está vinculado a um aluno. Fale com a coordenação.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          component="a"
          href={getBoletimUrl(studentId)}
          target="_blank"
          rel="noopener"
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
        >
          Baixar boletim em PDF
        </Button>
      </Box>
      <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        <Box sx={{ flex: 1, minWidth: 320 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Notas
          </Typography>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Simulado</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Nota</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {gradesQuery.data?.map((row) => (
                  <TableRow key={row.examId}>
                    <TableCell>{row.examName}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(row.examDate))}</TableCell>
                    <TableCell>{row.grade}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          {gradesQuery.data?.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Nenhuma nota lançada ainda.
            </Typography>
          )}
        </Box>

        <Box sx={{ flex: 1, minWidth: 320 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Presença
          </Typography>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Período</TableCell>
                  <TableCell>Presente</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {presenceQuery.data?.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{dateFormatter.format(new Date(row.classDate))}</TableCell>
                    <TableCell>{periodLabels[row.period]}</TableCell>
                    <TableCell>{row.present ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
          {presenceQuery.data?.length === 0 && (
            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Nenhum registro de presença ainda.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
