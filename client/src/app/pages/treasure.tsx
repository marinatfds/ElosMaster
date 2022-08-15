import * as React from 'react';
import api from "../config/endpoint";
import * as ROUTER from "../config/endpointRoutes";
import { TableContainer, TableHead, TableCell, TablePagination, Paper, Table, TableRow, TableBody} from '@mui/material';
import { TeamList } from '../../models/Team';
import { NavigationButton } from '../components/navigationButton';

const columns = [
  { field: 'expenseType', headerName: 'Tipo', flex: 1 },
  { field: 'description', headerName: 'Descrição', flex: 1 },
  { field: 'author', headerName: 'Autor', flex: 1 },
  { field: 'value', headerName: 'Valor', flex: 1 },
  { field: 'datePayment', headerName: 'Data', flex: 1 },
];

export default function Team() {
  const [team, setTeam] = React.useState<TeamList[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  React.useEffect(() => {
    api.get(ROUTER.GET_TREASURE).then(response => {
      setTeam(response.data);
    })
    const test: TeamList[] = team;
  }, []);

  return (
    <div className='main'>
      <NavigationButton to='/NewExpense'>Nova Despesa</NavigationButton>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  style={{ flex: column.flex }}
                >
                  {column.headerName}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {team
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                console.log(row.Name)
                return (
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    <TableCell>{row.Name}</TableCell>
                    <TableCell>{row.Campus}</TableCell>
                    <TableCell>{row.Position}</TableCell>
                    <TableCell>{row.Email}</TableCell>
                    <TableCell>{row.Phone}</TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10]}
        component="div"
        count={team.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
    </div>
  )
}