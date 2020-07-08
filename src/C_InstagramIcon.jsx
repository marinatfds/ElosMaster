import React from "react";

export function InstagramIcon({ children, to }) {
  return (
    <a href={to}>
     <img className="icon" src={require("./img/instagram.png")}/>
    </a>
  );
}
