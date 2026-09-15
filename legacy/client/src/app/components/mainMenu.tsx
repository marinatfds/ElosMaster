import React from "react";
import { FacebookIcon } from "./icons/facebook";
import { InstagramIcon } from "./icons/instagram";
import { TwitterIcon } from "./icons/twitter";
import { YoutubeIcon } from "./icons/youtube";
import { MenuLink } from "./menuLink";

export function MainMenu({ children } : any) {
  return (
      <div className="navigationBar">
        <nav>
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/team">Equipe</MenuLink>
            <MenuLink to="/calendar">Calend&aacute;rio</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/treasure">Tesouraria</MenuLink>
        </nav>
        <div>
            <FacebookIcon to="https://www.facebook.com/ElosEduca"/>
            <TwitterIcon to="#"/>
            <InstagramIcon to="https://www.instagram.com/eloseducacao/"/>
            <YoutubeIcon to="https://www.youtube.com/channel/UCC-t9-M_T_h3x5BtUNm4H7w" />
        </div>
      </div> 
  );
}