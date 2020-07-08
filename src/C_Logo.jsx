import React from "react";

export function Logo({ children, to }) {
  return (
    <a href={to}>
     <img className="logo" src={require("./logo.png")}/>
    </a>
  );
}
