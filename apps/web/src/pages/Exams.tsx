import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { createExamSchema, type CreateExamInput } from "@elosmaster/shared";
import { createExam, getExamGrades, listExams, saveExamGrades } from "../api/exams";

function NewExamDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateExamInput>({ resolver: zodResolver(createExamSchema) });

  const mutation = useMutation({
    mutationFn: createExam,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      enqueueSnackbar("Simulado criado", { variant: "success" });
      reset();
      onClose();
    },
    onError: () => enqueueSnackbar("Não foi possível criar o simulado", { variant: "error" }),
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo simulado</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((input) => mutation.mutate(input))}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nome"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <TextField
            label="Data"
            type="date"
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!errors.examDate}
            helperText={errors.examDate?.message}
            {...register("examDate")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Criar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

export function Exams() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<number, string>>({});

  const examsQuery = useQuery({ queryKey: ["exams"], queryFn: listExams });

  useEffect(() => {
    if (!selectedExamId && examsQuery.data && examsQuery.data.length > 0) {
      setSelectedExamId(examsQuery.data[0].id);
    }
  }, [examsQuery.data, selectedExamId]);

  const gradesQuery = useQuery({
    queryKey: ["exam-grades", selectedExamId],
    queryFn: () => getExamGrades(selectedExamId!),
    enabled: selectedExamId !== null,
  });

  useEffect(() => {
    if (gradesQuery.data) {
      const initial: Record<number, string> = {};
      for (const row of gradesQuery.data) {
        initial[row.studentId] = row.grade === null ? "" : String(row.grade);
      }
      setGradeInputs(initial);
    }
  }, [gradesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const grades = Object.entries(gradeInputs)
        .filter(([, value]) => value.trim() !== "")
        .map(([studentId, value]) => ({ studentId: Number(studentId), grade: Number(value) }));
      return saveExamGrades(selectedExamId!, { grades });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exam-grades", selectedExamId] });
      enqueueSnackbar("Notas salvas com sucesso", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível salvar as notas", { variant: "error" }),
  });

  return (
    <Box sx={{ p: 4, display: "flex", gap: 4 }}>
      <Box sx={{ minWidth: 240 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6">Simulados</Typography>
          <Button size="small" onClick={() => setDialogOpen(true)}>
            Novo
          </Button>
        </Box>
        <Paper>
          <List dense>
            {examsQuery.data?.map((exam) => (
              <ListItemButton
                key={exam.id}
                selected={exam.id === selectedExamId}
                onClick={() => setSelectedExamId(exam.id)}
              >
                <ListItemText primary={exam.name} secondary={exam.examDate} />
              </ListItemButton>
            ))}
          </List>
        </Paper>
      </Box>

      <Box sx={{ flex: 1 }}>
        {selectedExamId === null && (
          <Typography color="text.secondary">Nenhum simulado cadastrado ainda.</Typography>
        )}
        {selectedExamId !== null && (
          <>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h5">Notas</Typography>
              <Button variant="contained" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                Salvar notas
              </Button>
            </Box>
            <Paper>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Aluno</TableCell>
                    <TableCell width={160}>Nota</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gradesQuery.data?.map((row) => (
                    <TableRow key={row.studentId}>
                      <TableCell>{row.studentName}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          slotProps={{ htmlInput: { min: 0, max: 10, step: 0.1 } }}
                          value={gradeInputs[row.studentId] ?? ""}
                          onChange={(e) =>
                            setGradeInputs((prev) => ({ ...prev, [row.studentId]: e.target.value }))
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Box>

      <NewExamDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
