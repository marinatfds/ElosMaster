import React from "react";

export function MenuButton({ children, to /*, onClick*/ }) {
  return (
    <a href={to}>
      <button className="menuButton" /*onClick={onClick}*/>{children}</button>
    </a>
  );
}
