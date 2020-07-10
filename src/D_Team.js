import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";

export default function About() {
  return (
    <div className="home">
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