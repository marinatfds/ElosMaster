import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import {
  CAMPUSES,
  createExamSchema,
  updateExamSchema,
  type Campus,
  type CreateExamInput,
  type Exam,
  type UpdateExamInput,
} from "@elosmaster/shared";
import { createExam, getExamGrades, listExams, saveExamGrades, updateExam } from "../api/exams";

const ALL = "all";

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

function EditExamDialog({ exam, onClose }: { exam: Exam | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateExamInput>({ resolver: zodResolver(updateExamSchema) });

  useEffect(() => {
    if (exam) {
      reset({ name: exam.name, examDate: exam.examDate });
    }
  }, [exam, reset]);

  const mutation = useMutation({
    mutationFn: (input: UpdateExamInput) => updateExam(exam!.id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["exams"] });
      enqueueSnackbar("Simulado atualizado", { variant: "success" });
      onClose();
    },
    onError: () => enqueueSnackbar("Não foi possível atualizar o simulado", { variant: "error" }),
  });

  return (
    <Dialog open={exam !== null} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Editar simulado</DialogTitle>
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
            Salvar
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
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [gradeInputs, setGradeInputs] = useState<Record<number, string>>({});
  const [nameFilter, setNameFilter] = useState<string | null>(null);
  const [campusFilter, setCampusFilter] = useState<Campus | typeof ALL>(ALL);

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

  const nameOptions = useMemo(
    () => (gradesQuery.data ?? []).map((row) => row.studentName),
    [gradesQuery.data],
  );

  const filteredGrades = useMemo(() => {
    return (gradesQuery.data ?? []).filter(
      (row) =>
        (!nameFilter || row.studentName === nameFilter) &&
        (campusFilter === ALL || row.campus === campusFilter),
    );
  }, [gradesQuery.data, nameFilter, campusFilter]);

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
              <ListItem
                key={exam.id}
                disablePadding
                secondaryAction={
                  <IconButton
                    size="small"
                    aria-label="Editar"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingExam(exam);
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={exam.id === selectedExamId}
                  onClick={() => setSelectedExamId(exam.id)}
                >
                  <ListItemText primary={exam.name} secondary={exam.examDate} />
                </ListItemButton>
              </ListItem>
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
            <Box sx={{ display: "flex", alignItems: "end", gap: 2, mb: 2 }}>
              <Autocomplete
                options={nameOptions}
                value={nameFilter}
                onChange={(_, newValue) => setNameFilter(newValue)}
                sx={{ minWidth: 220 }}
                renderInput={(params) => <TextField {...params} label="Nome" size="small" />}
              />
              <TextField
                select
                label="Núcleo"
                size="small"
                sx={{ minWidth: 160 }}
                value={campusFilter}
                onChange={(e) => setCampusFilter(e.target.value as Campus | typeof ALL)}
              >
                <MenuItem value={ALL}>Todos</MenuItem>
                {CAMPUSES.map((campus) => (
                  <MenuItem key={campus} value={campus}>
                    {campus}
                  </MenuItem>
                ))}
              </TextField>
              <Box sx={{ flex: 1 }} />
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
                  {filteredGrades.map((row) => (
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
      <EditExamDialog exam={editingExam} onClose={() => setEditingExam(null)} />
    </Box>
  );
}
