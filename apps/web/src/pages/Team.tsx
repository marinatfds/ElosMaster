import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
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
import EditIcon from "@mui/icons-material/Edit";
import { CAMPUSES, TEAM_POSITIONS, type Campus, type TeamPosition } from "@elosmaster/shared";
import { listTeamMembers } from "../api/team";
import { useAuth } from "../auth/AuthContext";

const ALL = "all";

export function Team() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [campusFilter, setCampusFilter] = useState<Campus | typeof ALL>(ALL);
  const [positionFilter, setPositionFilter] = useState<TeamPosition | typeof ALL>(ALL);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const teamQuery = useQuery({ queryKey: ["team"], queryFn: listTeamMembers });

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
          {CAMPUSES.map((campus) => (
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
            setPositionFilter(e.target.value as TeamPosition | typeof ALL);
            setPage(0);
          }}
        >
          <MenuItem value={ALL}>Todos</MenuItem>
          {TEAM_POSITIONS.map((position) => (
            <MenuItem key={position} value={position}>
              {position}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ flex: 1 }} />
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
                      <TableCell>
                        <IconButton
                          component={RouterLink}
                          to={`/equipe/${member.id}/editar`}
                          size="small"
                          aria-label="Editar"
                        >
                          <EditIcon fontSize="small" />
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
    </Box>
  );
}
