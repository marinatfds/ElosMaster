import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { MenuButton } from "./component_obj/C_MenuButton";

export default function Calendar() {
  return (
    <div className="calendar">
      <HeaderLogo/>
      <MainMenu/>
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
