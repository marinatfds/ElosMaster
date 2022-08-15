import React from "react";
import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import Calendar from "./pages/calendar";
import Home from "./pages/home";
import Student from "./pages/student";
import Team from "./pages/team";
import Test from "./pages/test";
import Treasure from "./pages/treasure";
import NewExpense from "./pages/treasureNewExpense";
import "./layout/styles.css";
import 'react-block-ui/style.css';
import 'toastr/build/toastr.min.css'
import { HeaderLogo } from "./components/headerLogo";
import { MainMenu } from "./components/mainMenu";

const PrivateRoute: React.FC<any> = ({ component: Component, profiles, ...rest }) => (
  <Route {...rest} render={(props) => (
      //isAuthenticated() &&
      //    profileIsValid(profiles) ?
           <Component {...props} />
      //    : <Redirect to="/NotAuthorized" />
  )} />
);

const App = () => {
  return (
    <Router>
      <div>
        <HeaderLogo/>
        <MainMenu/>
        <Switch>
          <Route exact path="/" component={Home}></Route>
          <Route exact path="/Calendar" component={Calendar}></Route>
          <Route exact path="/Student" component={Student}></Route>
          <Route exact path="/Team" component={Team}></Route>
          <Route exact path="/Test" component={Test}></Route>
          <Route exact path="/Treasure" component={Treasure}></Route>
          <Route exact path="/NewExpense" component={NewExpense}></Route>
        </Switch>
      </div>
    </Router>
  )
}

export default App;


