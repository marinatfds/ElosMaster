import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useSnackbar } from "notistack";
import { isAxiosError } from "axios";
import type { Campus, TeamMember } from "@elosmaster/shared";
import { deleteTeamMember, listTeamMembers } from "../api/team";
import { listTeamPositions } from "../api/team-positions";
import { useCampuses } from "../hooks/useCampuses";
import { useAuth } from "../auth/AuthContext";

const ALL = "all";

function errorMessage(err: unknown, fallback: string) {
  if (isAxiosError(err) && typeof err.response?.data?.error === "string") {
    return err.response.data.error;
  }
  return fallback;
}

function DeleteMemberDialog({ member, onClose }: { member: TeamMember | null; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const mutation = useMutation({
    mutationFn: (id: number) => deleteTeamMember(id),
    onSuccess: () => {
      enqueueSnackbar("Membro removido com sucesso", { variant: "success" });
      onClose();
    },
    onError: (err) => {
      enqueueSnackbar(errorMessage(err, "Não foi possível remover o membro"), { variant: "error" });
      onClose();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
    },
  });

  return (
    <Dialog open={member !== null} onClose={onClose}>
      <DialogTitle>Remover membro</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Tem certeza que deseja remover <strong>{member?.name}</strong> da equipe?
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
          onClick={() => member && mutation.mutate(member.id)}
        >
          Remover
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function Team() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [campusFilter, setCampusFilter] = useState<Campus | typeof ALL>(ALL);
  const [positionFilter, setPositionFilter] = useState<string>(ALL);
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const teamQuery = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });
  const positionsQuery = useQuery({ queryKey: ["team-positions"], queryFn: listTeamPositions });
  const { names: campusNames } = useCampuses();

  const rows = useMemo(() => {
    return (teamQuery.data ?? []).filter(
      (member) =>
        (campusFilter === ALL || member.campus === campusFilter) &&
        (positionFilter === ALL || member.position === positionFilter),
    );
  }, [teamQuery.data, campusFilter, positionFilter]);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "end", gap: 2, mb: 2 }}>
        <TextField
          select
          label="Núcleo"
          size="small"
          sx={{ minWidth: 160 }}
          value={campusFilter}
          onChange={(e) => {
            setCampusFilter(e.target.value as Campus | typeof ALL);
            setPage(0);
          }}
        >
          <MenuItem value={ALL}>Todos</MenuItem>
          {campusNames.map((campus) => (
            <MenuItem key={campus} value={campus}>
              {campus}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Cargo"
          size="small"
          sx={{ minWidth: 220 }}
          value={positionFilter}
          onChange={(e) => {
            setPositionFilter(e.target.value);
            setPage(0);
          }}
        >
          <MenuItem value={ALL}>Todos</MenuItem>
          {(positionsQuery.data ?? []).map((position) => (
            <MenuItem key={position.id} value={position.name}>
              {position.name}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
        {isAdmin && (
          <Button component={RouterLink} to="/equipe/cargos" variant="outlined">
            Gerenciar cargos
          </Button>
        )}
        {isAdmin && (
          <Button component={RouterLink} to="/equipe/novo" variant="contained">
            Adicionar
          </Button>
        )}
      </Box>

      {teamQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {teamQuery.isError && <Typography color="error">Não foi possível carregar a equipe.</Typography>}

      {rows.length > 0 && (
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Núcleo</TableCell>
                  <TableCell>Cargo</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Celular</TableCell>
                  {isAdmin && <TableCell />}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>{member.name}</TableCell>
                    <TableCell>{member.campus}</TableCell>
                    <TableCell>{member.position}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phone}</TableCell>
                    {isAdmin && (
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <IconButton
                          component={RouterLink}
                          to={`/equipe/${member.id}/editar`}
                          size="small"
                          aria-label="Editar"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" aria-label="Remover" onClick={() => setDeleteTarget(member)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Paper>
      )}

      <DeleteMemberDialog member={deleteTarget} onClose={() => setDeleteTarget(null)} />
    </Box>
  );
}
