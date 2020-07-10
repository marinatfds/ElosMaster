import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";
import { NavigationButton } from "./C_NavigationButton";
/*import { MenuButton } from "./C_MenuButton";*/

export default function Tresure() {
  return (
    <div className="tresure">
      <div className="header">
        <Logo to="/"/>
      </div>
      <div className="navigationBar">
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/team">Equipe</MenuLink>
            <MenuLink to="/calendar">Calend&aacute;rio</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
      </div>
    </div>
  );
}
