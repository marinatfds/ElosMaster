import React from "react";

export default function PopupAlerts({ onSubmit }) {
  return (
    <div>
      <form onSubmit={onSubmit}>
        <input name="alertContent" className="PopupInput" />
        <button type="submit">Criar</button>
      </form>
    </div>
  );
}
