import React from "react";
import { MenuButton } from "./MenuButton";
import { NavigationButton } from "./NavigationButton";

export default function Coord() {
  return (
    <div className="coord">
      <h1>Coordenação</h1>
      <div className="menuAlign">
        <MenuButton>Geral</MenuButton>
        <MenuButton>Reuniões</MenuButton>
      </div>
      <div className="menuAlign">
        <MenuButton>Simulados</MenuButton>
        <MenuButton>Processo Seletivo</MenuButton>
      </div>
      <div className="menuAlign">
        <MenuButton>Ciranda de Livro</MenuButton>
        <MenuButton>Antigos</MenuButton>
      </div>
      <div>
        <NavigationButton to="/home">Voltar</NavigationButton>
      </div>
    </div>
  );
}
