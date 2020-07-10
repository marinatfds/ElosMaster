import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";

export default function About() {
  return (
    <div className="home">
      <HeaderLogo/>
      <MainMenu/>
    </div>
  );
}