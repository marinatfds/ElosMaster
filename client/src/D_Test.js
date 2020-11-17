import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { MenuButton } from "./component_obj/C_MenuButton";

export default function Test() {
  return (
    <div className="test">
      <HeaderLogo/>
      <MainMenu/>
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
