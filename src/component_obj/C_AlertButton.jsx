import React from "react";

export function AlertButton({ children, onClick }) {
  return (
    <button className="alertButton" onClick={onClick}>
      {children}
    </button>
  );
}
