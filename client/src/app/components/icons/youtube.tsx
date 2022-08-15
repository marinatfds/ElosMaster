import React from "react";

export function YoutubeIcon({ children, to } : any) {
  return (
    <a href={to}>
     <img className="icon" src={require("../../img/youtube.png")}/>
    </a>
  );
}