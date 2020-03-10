import React from "react";
import ReactDOM from "react-dom";
import "./styles.css";

import Home from "./D_Home";
import Coord from "./D_Coord";
import Calendar from "./D_Calendar";
import Tresure from "./D_Tresure";
import Student from "./D_Student";
import Test from "./D_Test";
import Sheet from "./D_Sheet";
import Old from "./D_Old";

const rootElement = document.getElementById("root");
const componentForRoute = {
  "/": <Home />,
  "/coord": <Coord />,
  "/calendar": <Calendar />,
  "/tresure": <Tresure />,
  "/student": <Student />,
  "/test": <Test />,
  "/sheet": <Sheet />,
  "/old": <Old />
};

ReactDOM.render(componentForRoute[document.location.pathname], rootElement);
