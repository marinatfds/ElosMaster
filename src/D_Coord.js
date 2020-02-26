import React from "react";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Coord() {
  return (
    <div className="coord">
      <h1>Coordenação</h1>
      <div className="menuButtonsAlign">
        <MenuButton>Geral</MenuButton>
        <MenuButton>Reuniões</MenuButton>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton>Simulados</MenuButton>
        <MenuButton>Processo Seletivo</MenuButton>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton>Ciranda de Livro</MenuButton>
        <MenuButton>Antigos</MenuButton>
      </div>
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
