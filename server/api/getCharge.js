const sql = require("mssql");

function getCharge(ctx) {
  if (!ctx.request.query.id) {
    throw new Error("ID is required!");
  }

  const sqlRequest = new sql.Request();

  const sqlQuery =
    "SELECT Expense_Type, Description, Author, Value, DateTime_Payment FROM Tresure WHERE ID = " +
    ctx.request.query.id;

  return sqlRequest
    .query(sqlQuery)
    .then((data) => {
      ctx.body = data.recordset[0];
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = getCharge;
