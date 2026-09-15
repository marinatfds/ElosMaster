import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CAMPUSES, createStudentSchema, type CreateStudentInput, type Campus } from "@elosmaster/shared";
import { createStudent, listStudents } from "../api/students";
import { getPresenceRoster, savePresence } from "../api/presence";

function NewStudentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStudentInput>({
    resolver: zodResolver(createStudentSchema),
    defaultValues: { campus: CAMPUSES[0], active: true },
  });

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      enqueueSnackbar("Aluno cadastrado com sucesso", { variant: "success" });
      reset();
      onClose();
    },
    onError: () => {
      enqueueSnackbar("Não foi possível cadastrar o aluno", { variant: "error" });
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Novo aluno</DialogTitle>
      <Box component="form" onSubmit={handleSubmit((input) => mutation.mutate(input))}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nome"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
          <Controller
            name="campus"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Núcleo">
                {CAMPUSES.map((campus) => (
                  <MenuItem key={campus} value={campus}>
                    {campus}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            Cadastrar
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

function RosterTab() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [campus, setCampus] = useState<Campus>(CAMPUSES[0]);
  const [classDate, setClassDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [period, setPeriod] = useState<"morning" | "afternoon">("morning");
  const [state, setState] = useState<Record<number, { present: boolean; comment: string }>>({});

  const rosterQuery = useQuery({
    queryKey: ["presence-roster", campus, classDate, period],
    queryFn: () => getPresenceRoster(campus, classDate, period),
  });

  useEffect(() => {
    if (rosterQuery.data) {
      const initial: Record<number, { present: boolean; comment: string }> = {};
      for (const row of rosterQuery.data) {
        initial[row.studentId] = { present: row.present ?? false, comment: row.comment ?? "" };
      }
      setState(initial);
    }
  }, [rosterQuery.data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      savePresence({
        records: Object.entries(state).map(([studentId, value]) => ({
          studentId: Number(studentId),
          classDate,
          period,
          present: value.present,
          comment: value.comment || undefined,
        })),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["presence-roster", campus, classDate, period] });
      enqueueSnackbar("Presença salva com sucesso", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Não foi possível salvar a presença", { variant: "error" }),
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <TextField select label="Núcleo" value={campus} onChange={(e) => setCampus(e.target.value as Campus)}>
          {CAMPUSES.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Data"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          value={classDate}
          onChange={(e) => setClassDate(e.target.value)}
        />
        <TextField
          select
          label="Período"
          value={period}
          onChange={(e) => setPeriod(e.target.value as "morning" | "afternoon")}
        >
          <MenuItem value="morning">Manhã</MenuItem>
          <MenuItem value="afternoon">Tarde</MenuItem>
        </TextField>
        <Button
          variant="contained"
          sx={{ ml: "auto" }}
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          Salvar presença
        </Button>
      </Box>

      {rosterQuery.data?.length === 0 && (
        <Typography color="text.secondary">Nenhum aluno ativo neste núcleo.</Typography>
      )}

      {(rosterQuery.data?.length ?? 0) > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Aluno</TableCell>
                <TableCell width={100}>Presente</TableCell>
                <TableCell>Observação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rosterQuery.data?.map((row) => (
                <TableRow key={row.studentId}>
                  <TableCell>{row.studentName}</TableCell>
                  <TableCell>
                    <Checkbox
                      checked={state[row.studentId]?.present ?? false}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          [row.studentId]: { ...prev[row.studentId], present: e.target.checked, comment: prev[row.studentId]?.comment ?? "" },
                        }))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      value={state[row.studentId]?.comment ?? ""}
                      onChange={(e) =>
                        setState((prev) => ({
                          ...prev,
                          [row.studentId]: { present: prev[row.studentId]?.present ?? false, comment: e.target.value },
                        }))
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}

function RegistrationTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: listStudents });
  const rows = studentsQuery.data ?? [];

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button variant="contained" onClick={() => setDialogOpen(true)}>
          Novo aluno
        </Button>
      </Box>

      {studentsQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {studentsQuery.isError && <Typography color="error">Não foi possível carregar os alunos.</Typography>}

      {rows.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Núcleo</TableCell>
                  <TableCell>Ativo</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.campus}</TableCell>
                    <TableCell>{student.active ? "Sim" : "Não"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <NewStudentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}

export function Students() {
  const [tab, setTab] = useState<"cadastro" | "presenca">("cadastro");

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5">Alunos</Typography>
      <Tabs value={tab} onChange={(_, value) => setTab(value)}>
        <Tab label="Cadastro" value="cadastro" />
        <Tab label="Presença" value="presenca" />
      </Tabs>

      {tab === "cadastro" && <RegistrationTab />}
      {tab === "presenca" && <RosterTab />}
    </Box>
  );
}
