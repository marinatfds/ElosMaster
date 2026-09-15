import { InputAdornment, Button, TextField, MenuItem } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import React from "react";

const expenseTypes = [
  "Alimentação",
  "Atividades",
  "Impressão",
  "Saúde",
  "Outros",
];

export default function NewExpense() {
  const [expenseType, setExpenseType] = React.useState("Alimentação");

  const changeExpenseType = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setExpenseType(event.target.value);
  };

  return (
    <div className="tresure">
      <form className="formNewExpense">
        <div>
          <TextField
            required
            label="Tipo de Gasto"
            variant="outlined"
            select
            value={expenseType}
            onChange={changeExpenseType}
          >
            {expenseTypes.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </div>
        <div>
          <TextField label="Descrição" variant="outlined" multiline rows={2}/>
        </div>
        <div>
          <TextField required label="Autor" variant="outlined" />
        </div>
        <div>
          <TextField
            required
            label="Valor"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">$</InputAdornment>
              ),
            }}
          />
        </div>
        <div>
          <TextField required label="Dia do Pagamento" variant="outlined" />
        </div>
      </form>
      <div>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SaveIcon />}
        >
          Delete
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SaveIcon />}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
