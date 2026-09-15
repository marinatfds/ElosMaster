import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { CAMPUSES, createStudentSchema, type CreateStudentInput } from "@elosmaster/shared";
import { createStudent, listStudents } from "../api/students";

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

export function Students() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const studentsQuery = useQuery({ queryKey: ["students"], queryFn: listStudents });
  const rows = studentsQuery.data ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Alunos</Typography>
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

      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        A lista de presença por aluno será adicionada na próxima fase.
      </Typography>

      <NewStudentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
