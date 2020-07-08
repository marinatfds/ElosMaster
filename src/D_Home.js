import React from "react";
import { Logo } from "./C_Logo";
import { MenuButton } from "./C_MenuButton";
import { MenuLink } from "./C_MenuLink";
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

  const openPopup = React.useCallback(function() {
    setShowPopup(true);
  }, []);

  const closePopup = React.useCallback(function() {
    setShowPopup(false);
    }, []);

  return (
    <div className="home">
      <div className="header">
        <Logo to="/"/>
      </div>
      <div className="navbar">
        <h1 className="menuButtonsAlign">
            <MenuLink to="/student">Alunos</MenuLink>
            <MenuLink to="/calendar">Calendário</MenuLink>
            <MenuLink to="/test">Simulados</MenuLink>
            <MenuLink to="/tresure">Tesouraria</MenuLink>
        </h1>
      </div>
      <div className="alertButtonsAlign">
        Alertas:
        <AlertButton onClick={openPopup}>Novo Alerta</AlertButton>
      </div>
      {showPopup && (
        <PopupAlerts onClose={closePopup} onSubmit={onCreateAlert} />
      )}
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
