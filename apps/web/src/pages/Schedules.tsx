import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
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
import EditIcon from "@mui/icons-material/Edit";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { listSchedules } from "../api/schedules";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function Schedules() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const schedulesQuery = useQuery({ queryKey: ["schedules"], queryFn: listSchedules });
  const rows = (schedulesQuery.data ?? []).filter((schedule) => {
    if (dateFrom && schedule.date < dateFrom) return false;
    if (dateTo && schedule.date > dateTo) return false;
    return true;
  });

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <DateRangeFilter
        from={dateFrom}
        to={dateTo}
        onFromChange={(value) => {
          setDateFrom(value);
          setPage(0);
        }}
        onToChange={(value) => {
          setDateTo(value);
          setPage(0);
        }}
      />
        <Button component={RouterLink} to="/horarios/novo" variant="contained">
          Novo Horário
        </Button>
      </Box>

      {schedulesQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {schedulesQuery.isError && <Typography color="error">Não foi possível carregar os horários.</Typography>}
      {schedulesQuery.isSuccess && rows.length === 0 && (
        <Typography color="text.secondary">Nenhum horário encontrado para o período selecionado.</Typography>
      )}

      {rows.length > 0 && (
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Campus</TableCell>
                  <TableCell>Data</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>{schedule.campus}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(schedule.date))}</TableCell>
                    <TableCell>
                      <IconButton
                        component={RouterLink}
                        to={`/horarios/${schedule.id}/editar`}
                        size="small"
                        aria-label="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
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
