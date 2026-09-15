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
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { listCharges } from "../api/charges";
import { getFinanceiroUrl } from "../api/reports";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function Treasury() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const chargesQuery = useQuery({ queryKey: ["charges"], queryFn: listCharges });
  const rows = chargesQuery.data ?? [];

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Tesouraria</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            component="a"
            href={getFinanceiroUrl()}
            target="_blank"
            rel="noopener"
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
          >
            Extrato em PDF
          </Button>
          <Button component={RouterLink} to="/tesouraria/nova" variant="contained">
            Nova Despesa
          </Button>
        </Box>
      </Box>

      {chargesQuery.isLoading && <Typography color="text.secondary">Carregando...</Typography>}
      {chargesQuery.isError && <Typography color="error">Não foi possível carregar as despesas.</Typography>}

      {rows.length > 0 && (
        <Paper>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell>Autor</TableCell>
                  <TableCell>Valor</TableCell>
                  <TableCell>Data de pagamento</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((charge) => (
                  <TableRow key={charge.id}>
                    <TableCell>{charge.expenseType}</TableCell>
                    <TableCell>{charge.description}</TableCell>
                    <TableCell>{charge.author}</TableCell>
                    <TableCell>{currencyFormatter.format(charge.value)}</TableCell>
                    <TableCell>{dateFormatter.format(new Date(charge.paymentDate))}</TableCell>
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
