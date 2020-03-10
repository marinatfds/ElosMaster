import React from "react";
import { NavigationButton } from "./C_NavigationButton";
/*import { MenuButton } from "./C_MenuButton";*/

export default function Sheet() {
  return (
    <div className="tresure">
      <h1>Fichas</h1>
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
