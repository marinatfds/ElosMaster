import React from "react";
import { MenuButton } from "./C_MenuButton";
import { AlertButton } from "./C_AlertButton";
import PopupAlerts from "./P_Alerts";

export default function Home() {
  const [alerts, setAlerts] = React.useState([]);
  const [showPopup, setShowPopup] = React.useState(false);

  const onCreateAlert = React.useCallback(function(event) {
    event.preventDefault();
    const content = event.target.elements.alertContent.value;
    setAlerts(prevAlerts => [
      {
        date: new Date().toLocaleString(),
        content
      },
      ...prevAlerts
    ]);
  }, []);

  const togglePopup = React.useCallback(function() {
    setShowPopup(function(prevShowPopup) {
      return !prevShowPopup;
    });
  }, []);

  return (
    <div className="home">
      <h1>Elos Master</h1>
      <div className="menuButtonsAlign">
        <MenuButton>Fichas</MenuButton>
        <MenuButton>Calendário</MenuButton>
      </div>
      <div className="menuButtonsAlign">
        <MenuButton to="/coord">Coordenação</MenuButton>
        <MenuButton>Tesouraria</MenuButton>
      </div>
      <div className="alertButtonsAlign">
        Alertas:
        <AlertButton onClick={togglePopup}>Criar</AlertButton>
      </div>
      {showPopup && <PopupAlerts onSubmit={onCreateAlert} />}
      {/* <div className="menuButtonsAlign">
        <input className="homeInput" onKeyDown={keyDownHandler} />
        <AlertButton>Criar</AlertButton> 
      </div> */}
      {alerts.length > 0 && (
        <ol className="orderedList">
          {alerts.map(function(item) {
            return (
              <li key={item.date}>
                [ {item.date} ] {item.content}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
