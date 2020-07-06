import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";
import Home from "./D_Home";
import Calendar from "./D_Calendar";
import Tresure from "./D_Tresure";
import Student from "./D_Student";
import Test from "./D_Test";

const rootElement = document.getElementById("root");
const componentForRoute = {
  "/": <Home />,
  "/calendar": <Calendar />,
  "/tresure": <Tresure />,
  "/student": <Student />,
  "/test": <Test />
};

ReactDOM.render(componentForRoute[document.location.pathname], rootElement);
