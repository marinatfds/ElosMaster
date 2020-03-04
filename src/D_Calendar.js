import React from "react";
import { MenuButton } from "./C_MenuButton";
import { NavigationButton } from "./C_NavigationButton";

export default function Calendar() {
  return (
    <div className="calendar">
      <h1>Calendário</h1>
      <div className="menuButtonsAlign">
        <MenuButton>Anual</MenuButton>
      </div>
      <div>
        <MenuButton>Horário FGV</MenuButton>
      </div>
      <div>
        <MenuButton>Horário PUC</MenuButton>
      </div>
      <div>
        <NavigationButton to="/">Voltar</NavigationButton>
      </div>
    </div>
  );
}
