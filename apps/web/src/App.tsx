import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { MainMenu } from "./components/MainMenu";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { NotAuthorized } from "./pages/NotAuthorized";
import { Home } from "./pages/Home";
import { Calendar } from "./pages/Calendar";
import { Students } from "./pages/Students";
import { Team } from "./pages/Team";
import { Exams } from "./pages/Exams";
import { Treasury } from "./pages/Treasury";
import { NewExpense } from "./pages/NewExpense";
import { MyStudent } from "./pages/MyStudent";

export function App() {
  return (
    <Box>
      <MainMenu />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/nao-autorizado" element={<NotAuthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/calendario" element={<Calendar />} />
        </Route>

        <Route element={<ProtectedRoute roles={["admin", "treinador"]} />}>
          <Route path="/alunos" element={<Students />} />
          <Route path="/equipe" element={<Team />} />
          <Route path="/simulados" element={<Exams />} />
          <Route path="/tesouraria" element={<Treasury />} />
          <Route path="/tesouraria/nova" element={<NewExpense />} />
        </Route>

        <Route element={<ProtectedRoute roles={["aluno_responsavel"]} />}>
          <Route path="/meu-aluno" element={<MyStudent />} />
        </Route>
      </Routes>
    </Box>
  );
}
