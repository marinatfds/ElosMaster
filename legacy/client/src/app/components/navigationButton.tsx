import React from "react";

export function NavigationButton({ children, to } : any) {
  return (
    <a href={to}>
      <button className="navigationButton"> {children} </button>
    </a>
  );
}
