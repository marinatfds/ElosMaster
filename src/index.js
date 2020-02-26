import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Home from "./Home";
import Coord from "./Coord";

const rootElement = document.getElementById("root");
const componentForRoute = {
  "/home": <Home />,
  "/coord": <Coord />
};

ReactDOM.render(componentForRoute[document.location.pathname], rootElement);
