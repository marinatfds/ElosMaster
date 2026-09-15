import React from "react";

export function Logo({ to } : any) {
  return (
    <a href={to}>
     <img className="logo" src={require("../../img/logo.png")}/>
    </a>
  );
}
