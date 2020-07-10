import React from "react";
import { MenuLink } from "../component_obj/C_MenuLink";
import { FacebookIcon } from "../component_obj/C_FacebookIcon";
import { InstagramIcon } from "../component_obj/C_InstagramIcon";
import { TwitterIcon } from "../component_obj/C_TwitterIcon";

export function MainMenu({ children }) {
  return (
      <div className="navigationBar">
        <div>
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/team">Equipe</MenuLink>
            <MenuLink to="/calendar">Calend&aacute;rio</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
        </div>
        <div>
            <FacebookIcon to="https://www.facebook.com/ElosEduca"/>
            <TwitterIcon to="#"/>
            <InstagramIcon to="https://www.instagram.com/eloseducacao/"/>
        </div>
      </div> 
  );
}