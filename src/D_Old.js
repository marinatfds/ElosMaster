import React from "react";
import { NavigationButton } from "./C_NavigationButton";
/*import { MenuButton } from "./C_MenuButton";*/

export default function Old() {
  return (
    <div className="tresure">
      <h1>Antigos</h1>
      <div>
        <NavigationButton to="/coord">Voltar</NavigationButton>
      </div>
    </div>
  );
}
