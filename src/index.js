import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Home from "./Home";
import Coord from "./Coord";

const rootElement = document.getElementById("root");

if (document.location.pathname === "/coord") {
  ReactDOM.render(<Coord />, rootElement);
} else {
  ReactDOM.render(<Home />, rootElement);
}
