import { Button } from "@mui/material";
import React from "react";

export function MenuButton({ children, to } : any) {
  return (
    <a href={to}>
      <Button variant="contained" size="large" className="menuButton">{children}</Button>
    </a>
  );
}
