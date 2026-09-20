import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link as RouterLink } from "react-router-dom";
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
import {
  createTeamPositionSchema,
  type CreateTeamPositionInput,
  type TeamPosition,
} from "@elosmaster/shared";
import {
  createTeamPosition,
  deleteTeamPosition,
  listTeamPositions,
  updateTeamPosition,
} from "../api/team-positions";

type FormTarget = { mode: "create" } | { mode: "edit"; position: TeamPosition };

function errorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
}

function PositionFormDialog({ target, onClose }: { target: FormTarget | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateTeamPositionInput>({
    resolver: zodResolver(createTeamPositionSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (target) {
      reset({ name: target.mode === "edit" ? target.position.name : "" });
    }
  }, [target, reset]);

  const mutation = useMutation({
    mutationFn: (input: CreateTeamPositionInput) =>
      target?.mode === "edit" ? updateTeamPosition(target.position.id, input) : createTeamPosition(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-positions"] });
      // Renomear um cargo também altera o cargo exibido nos membros.
      queryClient.invalidateQueries({ queryKey: ["team"] });
      enqueueSnackbar(target?.mode === "edit" ? "Cargo atualizado com sucesso" : "Cargo criado com sucesso", {
        variant: "success",
      });
      onClose();
    },
    onError: (err) => {
      if (isAxiosError(err) && err.response?.status === 409) {
        setError("name", { message: errorMessage(err, "Já existe um cargo com esse nome") });
        return;
      }
      enqueueSnackbar(errorMessage(err, "Não foi possível salvar o cargo"), { variant: "error" });
    },
  });

  return (
    <Dialog open={target !== null} onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit((input) => mutation.mutate(input))}>
        <DialogTitle>{target?.mode === "edit" ? "Editar cargo" : "Novo cargo"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nome do cargo"
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

function DeletePositionDialog({ position, onClose }: { position: TeamPosition | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteTeamPosition(id),
    onSuccess: () => {
      enqueueSnackbar("Cargo excluído com sucesso", { variant: "success" });
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, "Não foi possível excluir o cargo"), { variant: "error" });
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["team-positions"] });
    },
  });

  return (
    <Dialog open={position !== null} onClose={onClose}>
      <DialogTitle>Excluir cargo</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja excluir o cargo <strong>{position?.name}</strong>?
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
          onClick={() => position && mutation.mutate(position.id)}
        >
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function TeamPositions() {
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeamPosition | null>(null);

  const positionsQuery = useQuery({ queryKey: ["team-positions"], queryFn: listTeamPositions });
  const positions = positionsQuery.data ?? [];

  return (
    <Box sx={{ p: 4, maxWidth: 720, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <Typography variant="h5" sx={{ flex: 1 }}>
          Cargos da Equipe
        </Typography>
        <Button component={RouterLink} to="/equipe" variant="outlined">
          Voltar
        </Button>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormTarget({ mode: "create" })}>
          Novo cargo
        </Button>
      </Box>

      {positionsQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {positionsQuery.isError && <Typography color="error">Não foi possível carregar os cargos.</Typography>}
      {positionsQuery.isSuccess && positions.length === 0 && (
        <Typography color="text.secondary">Nenhum cargo cadastrado.</Typography>
      )}

      {positions.length > 0 && (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Cargo</TableCell>
                  <TableCell align="right">Membros</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {positions.map((position) => {
                  const inUse = position.memberCount > 0;
                  return (
                    <TableRow key={position.id}>
                      <TableCell>{position.name}</TableCell>
                      <TableCell align="right">{position.memberCount}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          size="small"
                          aria-label="Editar"
                          onClick={() => setFormTarget({ mode: "edit", position })}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <Tooltip title={inUse ? "Há membros atribuídos a este cargo" : "Excluir"}>
                          {/* span mantém o tooltip funcionando com o botão desabilitado */}
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Excluir"
                              disabled={inUse}
                              onClick={() => setDeleteTarget(position)}
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

      <PositionFormDialog target={formTarget} onClose={() => setFormTarget(null)} />
      <DeletePositionDialog position={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Box>
  );
}
