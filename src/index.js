import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Home from "./D_Home";
import Coord from "./D_Coord";

const rootElement = document.getElementById("root");
const componentForRoute = {
  "/": <Home />,
  "/coord": <Coord />
};

ReactDOM.render(componentForRoute[document.location.pathname], rootElement);
