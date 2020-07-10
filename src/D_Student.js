import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { MenuButton } from "./component_obj/C_MenuButton";
import FileViewer from 'react-file-viewer';

export default function Student() {
const file = "https://drive.google.com/file/d/0BzMVDwJw-KJpNlBwUFZEUExMeVE/view?usp=sharing"
const type = "pdf"
  return (
    <div className="student">
      <HeaderLogo/>
      <MainMenu/>
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
