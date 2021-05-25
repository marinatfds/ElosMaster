import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { MenuItem, TextField, InputAdornment, Button } from "@material-ui/core";
import { DeleteIcon, SaveIcon } from "@material-ui/icons";

const expenseTypes = [
  "Alimentação",
  "Atividades",
  "Impressão",
  "Saúde",
  "Outros",
];

export default function NewExpense() {
  const [expenseType, setExpenseType] = React.useState("Alimentação");

  const changeExpenseType = (event) => {
    setExpenseType(event.target.value);
  };

  return (
    <div className="tresure">
      <HeaderLogo />
      <MainMenu />
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
          <TextField label="Descrição" variant="outlined" multiline rows={2} />
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
          startIcon={<DeleteIcon />}
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
