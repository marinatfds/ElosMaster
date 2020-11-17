const sql = require("mssql");

function createAlert(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery =
    "INSERT INTO Alerts (Alert,DateTime) OUTPUT INSERTED.ID VALUES ('" +
    ctx.request.body.Alert +
    "', CONVERT(datetime, '" +
    ctx.request.body.DateTime +
    "',127))";

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = ctx.request.body;
      ctx.body.ID = data.recordset[0].ID;
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = createAlert;
