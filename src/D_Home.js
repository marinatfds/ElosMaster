import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { AlertButton } from "./component_obj/C_AlertButton";
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
      <HeaderLogo/>
      <MainMenu/>
      <div className="row">
        <div className="side">
            <div className="alertButtonsAlign">
            Últimas notícias:
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
        <div className="main">
            <i>"Nenhum de nós é tão bom quanto todos nós juntos!"</i>
        </div>
      </div>
    </div>
  );
}
