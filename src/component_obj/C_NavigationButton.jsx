import React from "react";

export function NavigationButton({ children, to }) {
  return (
    <a href={to}>
      <button className="navigationButton"> {children} </button>
    </a>
  );
}
