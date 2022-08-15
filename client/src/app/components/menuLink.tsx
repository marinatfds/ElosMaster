import React from "react";

export function MenuLink({ children, to } : any) {
    return (
    <a className="navigationBarInternalLink" href={to}>
      {children}
    </a>
  );
}
