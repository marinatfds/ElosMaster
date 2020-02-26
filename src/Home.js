import React from "react";
import { MenuButton } from "./MenuButton";
import { AlertButton } from "./AlertButton";

export default function Home() {
  const [alerts, setAlerts] = React.useState([]);

  const KeyDownHandler = React.useCallback(function(event) {
    const { value } = event.target;

    if (event.key === "Enter" && value) {
      const objectValue = {
        date: new Date().toLocaleString(),
        content: value
      };
      setAlerts(prevAlerts => [objectValue, ...prevAlerts]);
      event.target.value = "";
    }
  }, []);

  return (
    <div className="home">
      <h1>Elos Master</h1>
      <div className="menuAlign">
        <MenuButton>Fichas</MenuButton>
        <MenuButton>Calendário</MenuButton>
      </div>
      <div className="menuAlign">
        <MenuButton to="/coord">Coordenação</MenuButton>
        <MenuButton>Tesouraria</MenuButton>
      </div>
      <div>
        Alertas:
        <input onKeyDown={KeyDownHandler} />
        <AlertButton>Criar</AlertButton>
      </div>
      {alerts.length > 0 && (
        <ol className="orderedList">
          {alerts.map(function(item) {
            return (
              <li>
                [ {item.date} ] {item.content}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
