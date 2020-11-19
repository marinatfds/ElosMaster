import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { AlertButton } from "./component_obj/C_AlertButton";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
} from "@material-ui/core";
//import { ptBR } from '@material-ui/core/locale';

const columns = [
  { id: "Expense_Type", label: "Tipo", minWidth: 170, align: "center" },
  {
    id: "Description",
    label: "Descri\u00e7\u00e3o",
    minWidth: 170,
    align: "center",
  },
  { id: "Author", label: "Autor", minWidth: 170, align: "center" },
  {
    id: "Value",
    label: "Valor",
    minWidth: 170,
    align: "center",
    format: (value) => value.toFixed(2),
  },
  {
    id: "DateTime_Payment",
    label: "Data de Pagamento",
    minWidth: 170,
    align: "center",
    format: (value) => new Date(value).toLocaleString(),
  },
];

function postExpense(item) {
  fetch("http://localhost:5000/api/createCharge", {
    mode: "cors",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Alert: item.content,
      DateTime: item.date.toISOString(),
    }),
  });
}

export default function Tresure() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [rows, setRows] = React.useState([]);
  const [orderRowState, setOrderRowState] = React.useState({
    column: "DateTime_Payment",
    type: "desc",
  });

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  React.useEffect(function () {
    async function fetchData() {
      const response = await fetch("http://localhost:5000/api/getCharges", {
        mode: "cors",
      });
      const data = await response.json();
      setRows(data);
    }
    fetchData();
  }, []);

  function orderData(columnSort) {
    const newSortType =
      orderRowState.column === columnSort && orderRowState.type === "desc"
        ? "asc"
        : "desc";

    setRows((prevRows) => {
      const prevRowsCopy = [...prevRows];
      prevRowsCopy.sort(function (a, b) {
        if (a[columnSort] > b[columnSort])
          return newSortType === "asc" ? 1 : -1;
        if (a[columnSort] < b[columnSort])
          return newSortType === "asc" ? -1 : 1;
        return 0;
      });
      return prevRowsCopy;
    });
    setOrderRowState({ column: columnSort, type: newSortType });
  }

  return (
    <div className="tresure">
      <HeaderLogo />
      <MainMenu />
      <div className="tresureNewExpense">
        <a href="/tresure/newexpense">
          <AlertButton>Novo Gasto</AlertButton>
        </a>
      </div>
      <TableContainer className="tableTresure">
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sortDirection={
                    orderRowState.column === column.id
                      ? orderRowState.type
                      : "desc"
                  }
                >
                  <TableSortLabel
                    active={orderRowState.column === column.id}
                    direction={
                      orderRowState.column === column.id
                        ? orderRowState.type
                        : "desc"
                    }
                    onClick={function () {
                      orderData(column.id);
                    }}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => (
                <TableRow>
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align}>
                      {column.format
                        ? column.format(row[column.id])
                        : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          labelRowsPerPage="Linhas por p&aacute;gina"
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
}
