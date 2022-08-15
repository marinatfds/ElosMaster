const sql = require("mssql");

function getAlerts(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery = "SELECT Alert, DateTime FROM Alerts";

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = data.recordset;
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = getAlerts;
