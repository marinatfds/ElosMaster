import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useSnackbar } from "notistack";
import { EXPENSE_TYPES, createChargeSchema, type CreateChargeInput } from "@elosmaster/shared";
import { createCharge } from "../api/charges";

export function NewExpense() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateChargeInput>({
    resolver: zodResolver(createChargeSchema),
    defaultValues: { expenseType: EXPENSE_TYPES[0] },
  });

  const mutation = useMutation({
    mutationFn: createCharge,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["charges"] });
      enqueueSnackbar("Despesa registrada com sucesso", { variant: "success" });
      navigate("/tesouraria");
    },
    onError: () => {
      enqueueSnackbar("Não foi possível registrar a despesa", { variant: "error" });
    },
  });

  return (
    <Box sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Nova Despesa
      </Typography>
      <Paper
        component="form"
        onSubmit={handleSubmit((input) => mutation.mutate(input))}
        sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Controller
          name="expenseType"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Tipo de Gasto" error={!!errors.expenseType}>
              {EXPENSE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <TextField
          label="Descrição"
          multiline
          minRows={2}
          error={!!errors.description}
          helperText={errors.description?.message}
          {...register("description")}
        />

        <TextField
          label="Autor"
          error={!!errors.author}
          helperText={errors.author?.message}
          {...register("author")}
        />

        <TextField
          label="Valor"
          type="number"
          slotProps={{ input: { startAdornment: <InputAdornment position="start">R$</InputAdornment> } }}
          error={!!errors.value}
          helperText={errors.value?.message}
          {...register("value", { valueAsNumber: true })}
        />

        <TextField
          label="Dia do Pagamento"
          type="date"
          slotProps={{ inputLabel: { shrink: true } }}
          error={!!errors.paymentDate}
          helperText={errors.paymentDate?.message}
          {...register("paymentDate")}
        />
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/tesouraria"
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            Voltar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={isSubmitting}
            sx={{ flex: 1 }}
          >
            Salvar
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
