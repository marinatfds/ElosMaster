const sql = require("mssql");

function createCharge(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery =
    "INSERT INTO Tresure (Expense_Type, Description, Author, Value, DateTime_Inclusion, DateTime_Payment) OUTPUT INSERTED.ID VALUES ('" +
    ctx.request.body.expenseType +
    "', '" +
    ctx.request.body.description +
    "', '" +
    ctx.request.body.author +
    "', " +
    ctx.request.body.value +
    ", GETDATE(), CONVERT(datetime, '" +
    ctx.request.body.dateTimePayment +
    "',127))";

  console.log(sqlQuery);
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

module.exports = createCharge;
