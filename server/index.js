const sql = require("mssql");

sql
  .connect("mssql://nodedagalere:nodedagalere@localhost/ElosMaster")
  .then(() => {
    const Koa = require("koa");
    const Router = require("@koa/router");
    const Cors = require("koa-cors");
    const bodyParser = require("koa-bodyparser");

    const app = new Koa();
    const router = new Router();
    app.use(bodyParser());
    app.use(Cors());
    const getAlerts = require("./api/getAlerts");
    const getAlert = require("./api/getAlert");
    const getCharges = require("./api/getCharges");
    const getCharge = require("./api/getCharge");

    const createAlert = require("./api/createAlert");
    const createCharge = require("./api/createCharge");
    const createPresence = require("./api/createPresence");
    const createTest = require("./api/createTest");

    const editAlert = require("./api/editAlert");

    router.get("/api/getAlerts", getAlerts);
    router.get("/api/getAlert", getAlert);
    router.get("/api/getCharges", getCharges);
    router.get("/api/getCharge", getCharge);

    router.post("/api/createAlert", createAlert);
    router.post("/api/createCharge", createCharge);
    router.post("/api/createPresence", createPresence);
    router.post("/api/createTest", createTest);

    router.patch("/api/editAlert", editAlert);

    app.use(router.routes()).use(router.allowedMethods());

    app.listen(5000);
  })
  .catch((err) => {
    console.log(err);
  });
