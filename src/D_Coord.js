import React from "react";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Coord() {
  return (
    <div className="coord">
      <h1>Coordenação</h1>
      <div className="menuButtonsAlign">
        <MenuButton to="/student">Alunos</MenuButton>
        <MenuButton>Reuniões</MenuButton>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton to="/test">Simulados</MenuButton>
        <MenuButton>Processo Seletivo</MenuButton>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton>Ciranda de Livro</MenuButton>
        <MenuButton to="/old">Antigos</MenuButton>
      </div>
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
