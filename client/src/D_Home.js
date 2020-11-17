import React from "react";
import { HeaderLogo } from "./component_area/C_HeaderLogo";
import { MainMenu } from "./component_area/C_MainMenu";
import { AlertButton } from "./component_obj/C_AlertButton";
import PopupAlerts from "./P_Alerts";

function postAlert(item) {
    fetch("http://localhost:5000/api/createAlert", {
        mode: "cors", method: "POST", headers: { "Content-Type": "application/json" } , body: JSON.stringify(
            {
                Alert: item.content,
                DateTime: item.date.toISOString()
            })
    }); 
}

export default function Home() {
  const [alerts, setAlerts] = React.useState([]);
  const [showPopup, setShowPopup] = React.useState(false);

  const onCreateAlert = React.useCallback(function(event) {
    event.preventDefault();
    const content = event.target.elements.alertContent.value;
    const item = {
          date: new Date(),
          content
      };
    postAlert(item);
    setAlerts(prevAlerts => [
      item,
      ...prevAlerts
    ]);
  }, []);

  const openPopup = React.useCallback(function() {
      setShowPopup(true);
  }, []);

  const closePopup = React.useCallback(function() {
    setShowPopup(false);
  }, []);

    React.useEffect(function () {
        async function fetchData() {
            const response = await fetch("http://localhost:5000/api/getAlerts", { mode: "cors" });
            const data = await response.json();
            const formattedData = data.map(function (item) {
                return {
                    date: new Date(item.DateTime),
                    content: item.Alert
                }
            })
            setAlerts(formattedData);
        }
        fetchData();
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
                    [ {item.date.toLocaleString()} ] {item.content}
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
