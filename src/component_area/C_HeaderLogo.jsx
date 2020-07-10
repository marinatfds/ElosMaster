import React from "react";
import { Logo } from "../component_obj/C_Logo";

export function HeaderLogo({ children }) {
  return (
      <div className="header">
        <Logo to="/"/>
      </div>
  );
}