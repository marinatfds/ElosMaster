const sql = require("mssql");

function createTest(ctx) {
  const sqlRequest = new sql.Request();

  const sqlQuery =
    "INSERT INTO Tests (StudentId, Grade1, Grade2, Grade3, Grade4, Grade5, Grade6, Grade7, Grade8, " + 
    "Presence1, Presence2, Presence3, Presence4, Presence5, Presence6, Presence7, Presence8) OUTPUT INSERTED.ID VALUES ('" +
    ctx.request.body.studentId +
    "', '" +
    ctx.request.body.grade1 +
    "', '" +
    ctx.request.body.grade2 +
    "', " +
    ctx.request.body.grade3 +
    "', '" +
    ctx.request.body.grade4 +
    "', '" +
    ctx.request.body.grade5 +
    "', " +
    ctx.request.body.grade6 +
    "', '" +
    ctx.request.body.grade7 +
    "', '" +
    ctx.request.body.grade8 +
    "', " +
    ctx.request.body.presence1 +
    "', '" +
    ctx.request.body.presence2 +
    "', " +
    ctx.request.body.presence3 +
    "', '" +
    ctx.request.body.presence4 +
    "', '" +
    ctx.request.body.presence5 +
    "', " +
    ctx.request.body.presence6 +
    "', '" +
    ctx.request.body.presence7 +
    "', '" +
    ctx.request.body.presence8;

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

module.exports = createTest;
