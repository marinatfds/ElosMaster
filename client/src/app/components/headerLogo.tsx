import React from "react";
import { Logo } from "./icons/logo";

export function HeaderLogo({ children } : any) {
  return (
      <div className="header">
        <Logo to="/"/>
      </div>
  );
}