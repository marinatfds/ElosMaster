import React from "react";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Student() {
  return (
    <div className="student">
      <h1>Alunos</h1>
      <div>
        <MenuButton>Lista de Presença FGV</MenuButton>
        <MenuButton>Lista de Presença PUC</MenuButton>
      </div>
      <div>
        <MenuButton>Alunos FGV</MenuButton>
        <MenuButton>Alunos PUC</MenuButton>
      </div>
      <div>
        <NavigationButton to="/coord">Voltar</NavigationButton>
      </div>
    </div>
  );
}
