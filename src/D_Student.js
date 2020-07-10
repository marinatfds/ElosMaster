import React from "react";
import { Logo } from "./C_Logo";
import { MenuLink } from "./C_MenuLink";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";
import FileViewer from 'react-file-viewer';

export default function Student() {
const file = "https://drive.google.com/file/d/0BzMVDwJw-KJpNlBwUFZEUExMeVE/view?usp=sharing"
const type = "pdf"
  return (
    <div className="student">
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
      <div>
        <MenuButton>Lista de Presença FGV</MenuButton>
        <MenuButton>Lista de Presença PUC</MenuButton>
      </div>
      <div>
        <MenuButton>Alunos FGV</MenuButton>
        <MenuButton>Alunos PUC</MenuButton>
        <FileViewer
        fileType={type}
        filePath={file}
        onError={console.log}/>
      </div>
    </div>
  );
}
