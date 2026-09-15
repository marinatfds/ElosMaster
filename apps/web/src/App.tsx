import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material";
import { Sidebar } from "./components/Sidebar";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Login } from "./pages/Login";
import { NotAuthorized } from "./pages/NotAuthorized";
import { Home } from "./pages/Home";
import { Students } from "./pages/Students";
import { Team } from "./pages/Team";
import { NewTeamMember } from "./pages/NewTeamMember";
import { EditTeamMember } from "./pages/EditTeamMember";
import { Exams } from "./pages/Exams";
import { Treasury } from "./pages/Treasury";
import { NewExpense } from "./pages/NewExpense";
import { EditExpense } from "./pages/EditExpense";
import { Schedules } from "./pages/Schedules";
import { NewSchedule } from "./pages/NewSchedule";
import { EditSchedule } from "./pages/EditSchedule";
import { MyStudent } from "./pages/MyStudent";

export function App() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/nao-autorizado" element={<NotAuthorized />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Home />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin", "treinador"]} />}>
            <Route path="/alunos" element={<Students />} />
            <Route path="/equipe" element={<Team />} />
            <Route path="/simulados" element={<Exams />} />
            <Route path="/tesouraria" element={<Treasury />} />
            <Route path="/tesouraria/nova" element={<NewExpense />} />
            <Route path="/tesouraria/:id/editar" element={<EditExpense />} />
          </Route>

          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/equipe/novo" element={<NewTeamMember />} />
            <Route path="/equipe/:id/editar" element={<EditTeamMember />} />
            <Route path="/horarios" element={<Schedules />} />
            <Route path="/horarios/novo" element={<NewSchedule />} />
            <Route path="/horarios/:id/editar" element={<EditSchedule />} />
          </Route>

          <Route element={<ProtectedRoute roles={["aluno_responsavel"]} />}>
            <Route path="/meu-aluno" element={<MyStudent />} />
          </Route>
        </Routes>
      </Box>
    </Box>
  );
}
