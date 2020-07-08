import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Student() {
  return (
    <div className="student">
      <div className="header">
        <Logo to="/"/>
      </div>
      <div className="navigationBar">
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/calendar">Calendário</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
      </div>
      <div>
        <MenuButton>Lista de Presença FGV</MenuButton>
        <MenuButton>Lista de Presença PUC</MenuButton>
      </div>
      <div>
        <MenuButton>Alunos FGV</MenuButton>
        <MenuButton>Alunos PUC</MenuButton>
      </div>
    </div>
  );
}
