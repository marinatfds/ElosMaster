import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { listSchedules } from "../api/schedules";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function Schedules() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: listSchedules });
  const rows = schedulesQuery.data ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Horários</Typography>
        <Button component={RouterLink} to="/horarios/novo" variant="contained">
          Novo Horário
        </Button>
      </Box>

      {schedulesQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {schedulesQuery.isError && <Typography color="error">Não foi possível carregar os horários.</Typography>}

      {rows.length > 0 && (
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Campus</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell>Slots preenchidos</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.campus}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(schedule.date))}</TableCell>
                    <TableCell>{schedule.slots.length}</TableCell>
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
