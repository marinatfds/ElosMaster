import { useState } from "react";
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useSnackbar } from "notistack";
import type { Charge } from "@elosmaster/shared";
import { DateRangeFilter } from "../components/DateRangeFilter";
import { deleteCharge, listCharges } from "../api/charges";
import { getFinanceiroUrl } from "../api/reports";

const currencyFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" });

export function Treasury() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [chargeToDelete, setChargeToDelete] = useState<Charge | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const chargesQuery = useQuery({ queryKey: ["charges"], queryFn: listCharges });
  const rows = (chargesQuery.data ?? []).filter((charge) => {
    if (dateFrom && charge.paymentDate < dateFrom) return false;
    if (dateTo && charge.paymentDate > dateTo) return false;
    return true;
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      enqueueSnackbar("Despesa removida com sucesso", { variant: "success" });
      setChargeToDelete(null);
    },
    onError: () => {
      enqueueSnackbar("Não foi possível remover a despesa", { variant: "error" });
    },
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
      {chargesQuery.isSuccess && rows.length === 0 && (
        <Typography color="text.secondary">Nenhuma despesa encontrada para o período selecionado.</Typography>
      )}

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
                  <TableCell />
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
                    <TableCell>
                      <IconButton
                        component={RouterLink}
                        to={`/tesouraria/${charge.id}/editar`}
                        size="small"
                        aria-label="Editar"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label="Remover"
                        onClick={() => setChargeToDelete(charge)}
                      >
                        <DeleteIcon fontSize="small" />
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

      <Dialog open={chargeToDelete !== null} onClose={() => setChargeToDelete(null)}>
        <DialogTitle>Remover despesa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Tem certeza que deseja remover a despesa "{chargeToDelete?.description}"? Esta ação não pode ser
            desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChargeToDelete(null)} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => chargeToDelete && deleteMutation.mutate(chargeToDelete.id)}
            disabled={deleteMutation.isPending}
          >
            Remover
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
