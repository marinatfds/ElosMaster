import React from "react";

export function MenuLink({ children, to }) {
  return (
    <a href={to}>
      {children}
    </a>
  );
}
