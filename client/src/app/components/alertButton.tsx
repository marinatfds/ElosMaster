import { Button } from "@mui/material";
import React from "react";

export function AlertButton({ children, onClick } : any) {
  return (
    <Button variant="contained" size="small" className="alertButton" onClick={onClick}>{children}</Button>
  );
}
