import React from "react";

export function FacebookIcon({ children, to } : any) {
  return (
    <a href={to}>
     <img className="icon" src={require("../../img/facebook.png")}/>
    </a>
  );
}
