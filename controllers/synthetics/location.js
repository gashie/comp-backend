const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const GlobalModel = require("../../model/Global");
const { autoProcessServiceToken } = require("../../helper/autoCreateEnrollment");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateLocationPolicy = asynHandler(async (req, res, next) => {
    /**
 * Create new role.
 * @param {string} location_name - Name or title of the application.
 * @param {string} location_description - Description: Managerial role.
 *  * @param {uuid} policy_id - Description: 12ds-2-21212.
 */
    let payload = req.body;
    let results = await GlobalModel.Create(payload, 'fleets', '');
    let { service_token, fleet_id } = await autoProcessServiceToken(req, results.rows)

    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "New fleet added", { service_token, fleet_id, ...req.body })
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})

exports.ViewLocationPolicy = asynHandler(async (req, res, next) => {
    // let userData = req.user;

    const tableName = 'fleets';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdateLocationPolicy = asynHandler(async (req, res, next) => {
    let payload = req.body;
    payload.last_updated = systemDate

    const runupdate = await GlobalModel.Update(payload, 'fleets', 'fleet_id', payload.fleet_id)
    if (runupdate.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record Updated", runupdate.rows[0])


    } else {
        return sendResponse(res, 0, 200, "Update failed, please try later", [])
    }
})

/**
 * app versions

 */
