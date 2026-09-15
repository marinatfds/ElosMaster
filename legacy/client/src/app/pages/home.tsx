import React from "react";
import AlertArea from "../components/alertArea";

export default function Home() {
  return (
    <div className="home">
      <div className="row">
        <div className="side">
          <AlertArea/>
        </div>
        <div className="main">
            <i>"Nenhum de nós é tão bom quanto todos nós juntos!"</i>
        </div>
      </div>
    </div>
  );
}
