const sql = require("mssql");

function getAlert(ctx) {
  if (!ctx.request.query.ID) {
    throw new Error("ID is required!");
  }

  const sqlRequest = new sql.Request();

  const sqlQuery =
    "SELECT Alert, DateTime, ID FROM Alerts WHERE ID = " + ctx.request.query.ID;

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = data.recordset[0];
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = getAlert;
