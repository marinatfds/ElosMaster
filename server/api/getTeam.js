const sql = require("mssql");

function getTeam(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery = "SELECT Name, Campus, Position, Email, Phone FROM Team ORDER BY Name";

  console.log(sqlQuery);

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = data.recordset;
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = getTeam;
