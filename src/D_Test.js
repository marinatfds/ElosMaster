import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Test() {
  return (
    <div className="test">
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
        <MenuButton>Simulado 1</MenuButton>
        <MenuButton>Simulado 2</MenuButton>
      </div>
      <div>
        <MenuButton>Simulado 3</MenuButton>
        <MenuButton>Simulado 4</MenuButton>
      </div>
      <div>
        <MenuButton>Simulado 5</MenuButton>
        <MenuButton>Simulado 6</MenuButton>
      </div>
      <div>
        <MenuButton>Simulado 7</MenuButton>
        <MenuButton>Simulado 8</MenuButton>
      </div>
    </div>
  );
}
