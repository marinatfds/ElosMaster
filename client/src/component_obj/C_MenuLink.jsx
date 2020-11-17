import React from "react";

export function MenuLink({ children, to }) {
    return (
    <a className="navigationBarInternalLink" href={to}>
      {children}
    </a>
  );
}
