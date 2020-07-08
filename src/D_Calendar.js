import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Calendar() {
  return (
    <div className="calendar">
      <div className="header">
        <Logo to="/"/>
      </div>
      <div className="navigationBar">
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/calendar">Calendário</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton>Anual</MenuButton>
      </div>
      <div>
        <MenuButton>Horário FGV</MenuButton>
      </div>
      <div>
        <MenuButton>Horário PUC</MenuButton>
      </div>
    </div>
  );
}
