import React from "react";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Test() {
  return (
    <div className="test">
      <h1>Simulados</h1>
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
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
