const sql = require("mssql");

function getCharges(ctx) {
  const sqlRequest = new sql.Request();
  const sqlQuery =
    "SELECT Expense_Type, Description, Author, Value, DateTime_Payment, ID FROM Tresure";

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = data.recordset;
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = getCharges;
