import React from "react";
import { NavigationButton } from "./C_NavigationButton";
/*import { MenuButton } from "./C_MenuButton";*/

export default function Tresure() {
  return (
    <div className="tresure">
      <h1>Tesouraria</h1>
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
