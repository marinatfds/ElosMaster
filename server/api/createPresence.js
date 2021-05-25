const sql = require("mssql");

function createPresence(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery =
    "INSERT INTO Presence (StudentId, PresenceMorning, PresenceAfternoon, Comment, ClassDate) OUTPUT INSERTED.ID VALUES ('" +
    ctx.request.body.studentId +
    "', '" +
    ctx.request.body.presenceMorning +
    "', '" +
    ctx.request.body.presenceAfternoon +
    "', " +
    ctx.request.body.comment +
    ", GETDATE(), CONVERT(datetime, '" +
    ctx.request.body.ClassDate +
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

module.exports = createPresence;
