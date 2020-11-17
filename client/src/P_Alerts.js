import React from "react";

export default function PopupAlerts({ onClose, onSubmit }) {
  return (
    <div className="popupAlerts">
      <div className="alertFormContainer">
        <button className="popupCloseButton" onClick={onClose}>
          x
        </button>

        <form className="alertForm" onSubmit={onSubmit}>
          <label className="alertLabel" htmlFor="newAlert">
            Novo Alerta
          </label>

          <textarea
            id="newAlert"
            name="alertContent"
            className="PopupInput"
            placeholder="Digite algo"
          />

          <button type="submit">Criar</button>
        </form>
      </div>
    </div>
  );
}
