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
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import { isAxiosError } from "axios";
import { createCampusSchema, type CampusInfo, type CreateCampusInput } from "@elosmaster/shared";
import { createCampus, deleteCampus, listCampuses, updateCampus } from "../api/campuses";

type FormTarget = { mode: "create" } | { mode: "edit"; campus: CampusInfo };

function errorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
}

// Renomear ou excluir um núcleo muda o que aparece nas telas que o exibem.
function invalidateCampusDependents(queryClient: ReturnType<typeof useQueryClient>) {
  for (const key of ["campuses", "students", "team", "schedules", "presence-roster"]) {
    queryClient.invalidateQueries({ queryKey: [key] });
  }
}

function CampusFormDialog({ target, onClose }: { target: FormTarget | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateCampusInput>({
    resolver: zodResolver(createCampusSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (target) {
      reset({ name: target.mode === "edit" ? target.campus.name : "" });
    }
  }, [target, reset]);

  const mutation = useMutation({
    mutationFn: (input: CreateCampusInput) =>
      target?.mode === "edit" ? updateCampus(target.campus.id, input) : createCampus(input),
    onSuccess: () => {
      invalidateCampusDependents(queryClient);
      enqueueSnackbar(target?.mode === "edit" ? "Núcleo atualizado com sucesso" : "Núcleo criado com sucesso", {
        variant: "success",
      });
      onClose();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError("name", { message: errorMessage(err, "Já existe um núcleo com esse nome") });
        return;
      }
      enqueueSnackbar(errorMessage(err, "Não foi possível salvar o núcleo"), { variant: "error" });
    },
  });

  return (
    <Dialog open={target !== null} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit((input) => mutation.mutate(input))}>
        <DialogTitle>{target?.mode === "edit" ? "Editar núcleo" : "Novo núcleo"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nome do núcleo"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register("name")}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

function DeleteCampusDialog({ campus, onClose }: { campus: CampusInfo | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteCampus(id),
    onSuccess: () => {
      enqueueSnackbar("Núcleo excluído com sucesso", { variant: "success" });
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, "Não foi possível excluir o núcleo"), { variant: "error" });
      onClose();
    },
    onSettled: () => {
      invalidateCampusDependents(queryClient);
    },
  });

  return (
    <Dialog open={campus !== null} onClose={onClose}>
      <DialogTitle>Excluir núcleo</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o núcleo <strong>{campus?.name}</strong>?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={mutation.isPending}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={mutation.isPending}
          onClick={() => campus && mutation.mutate(campus.id)}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function inUseReason(campus: CampusInfo) {
  const parts: string[] = [];
  if (campus.studentCount > 0) parts.push(`${campus.studentCount} aluno(s)`);
  if (campus.memberCount > 0) parts.push(`${campus.memberCount} membro(s) da equipe`);
  if (campus.scheduleCount > 0) parts.push(`${campus.scheduleCount} horário(s)`);
  return parts.length > 0 ? `Não é possível excluir: há ${parts.join(", ")} neste núcleo` : null;
}

export function Campuses() {
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CampusInfo | null>(null);

  const campusesQuery = useQuery({ queryKey: ["campuses"], queryFn: listCampuses });
  const campuses = campusesQuery.data ?? [];

  return (
    <Box sx={{ p: 4, maxWidth: 840, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Núcleos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormTarget({ mode: "create" })}>
          Novo núcleo
        </Button>
      </Box>

      {campusesQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {campusesQuery.isError && <Typography color="error">Não foi possível carregar os núcleos.</Typography>}
      {campusesQuery.isSuccess && campuses.length === 0 && (
        <Typography color="text.secondary">Nenhum núcleo cadastrado.</Typography>
      )}

      {campuses.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Núcleo</TableCell>
                  <TableCell align="right">Alunos</TableCell>
                  <TableCell align="right">Equipe</TableCell>
                  <TableCell align="right">Horários</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {campuses.map((campus) => {
                  const reason = inUseReason(campus);
                  return (
                    <TableRow key={campus.id}>
                      <TableCell>{campus.name}</TableCell>
                      <TableCell align="right">{campus.studentCount}</TableCell>
                      <TableCell align="right">{campus.memberCount}</TableCell>
                      <TableCell align="right">{campus.scheduleCount}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          aria-label="Editar"
                          onClick={() => setFormTarget({ mode: "edit", campus })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Tooltip title={reason ?? "Excluir"}>
                          {/* span mantém o tooltip funcionando com o botão desabilitado */}
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Excluir"
                              disabled={reason !== null}
                              onClick={() => setDeleteTarget(campus)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <CampusFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
      <DeleteCampusDialog campus={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Box>
  );
}
