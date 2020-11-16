import React from "react";
import { MenuLink } from "../component_obj/C_MenuLink";
import { FacebookIcon } from "../component_obj/C_IconFacebook";
import { InstagramIcon } from "../component_obj/C_IconInstagram";
import { TwitterIcon } from "../component_obj/C_IconTwitter";
import { YoutubeIcon } from "../component_obj/C_IconYoutube";

export function MainMenu({ children }) {
  return (
      <div className="navigationBar">
        <nav>
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/team">Equipe</MenuLink>
            <MenuLink to="/calendar">Calend&aacute;rio</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
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