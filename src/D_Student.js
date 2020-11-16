import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { MenuButton } from "./component_obj/C_MenuButton";

export default function Student() {
  return (
    <div className="student">
      <HeaderLogo/>
      <MainMenu/>
      <div>
        <MenuButton>Lista de Presença FGV</MenuButton>
        <MenuButton>Lista de Presença PUC</MenuButton>
      </div>
      <div>
         <iframe src="https://docs.google.com/viewer?srcid=1_Kn3DYra-Afk35bj-Xsp30B68Qurg-8v&pid=explorer&efh=false&a=v&chrome=false&embedded=true" width="500px" height="365px"></iframe>
         <iframe src="https://docs.google.com/viewer?srcid=11I5uIQK8wQ6I02hQ6mylrXIC9RCqkuYe&pid=explorer&efh=false&a=v&chrome=false&embedded=true" width="500px" height="365px"></iframe>
      </div>
    </div>
  );
}
