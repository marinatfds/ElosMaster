import React from "react";

export function TwitterIcon({ children, to } : any) {
  return (
    <a href={to}>
     <img className="icon" src={require("../../img/twitter.png")}/>
    </a>
  );
}