const sql = require('mssql');

function editAlert(ctx) {

    if (!ctx.request.body.ID) {
        throw new Error('ID is required!')
    }

    if (!ctx.request.body.Alert && !ctx.request.body.DateTime) {
        throw new Error('Nothing to change!')
    }

    const fieldsToChange = [];

    if (ctx.request.body.Alert) {
        fieldsToChange.push('Alert = \'' + ctx.request.body.Alert + '\'');
    };

    if (ctx.request.body.DateTime) {
        fieldsToChange.push('DateTime = \'' + ctx.request.body.DateTime + '\'');
    };

    const sqlQuery = 'UPDATE Alerts SET ' + fieldsToChange.join(', ') + ' WHERE ID = \'' + ctx.request.body.ID + '\'';

    const sqlRequest = new sql.Request();

    return sqlRequest.query(sqlQuery).then(() => {
        ctx.body = ctx.request.body;
    }).catch(err => { console.log(err) })

}

module.exports = editAlert;