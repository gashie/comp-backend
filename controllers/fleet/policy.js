const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const GlobalModel = require("../../model/Global");
const { autoProcessPolicyEnrollment } = require("../../helper/autoCreateEnrollment");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateFleetAgentPolicy = asynHandler(async (req, res, next) => {
    /**
 * Create new role.
 * @param {string} polic_name - Name or title of the application.
 * @param {string} polic_description - Description: Managerial role.
 * @returns {Object} polic_configuration - Object containing role details.
 */
    let payload = req.body;
    let results = await GlobalModel.Create(payload, 'policies', '');
    let { enrollment_token, policy_id } = await autoProcessPolicyEnrollment(req, results.rows)

    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "New policy added", { enrollment_token, policy_id, ...req.body })
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})

exports.ViewFleetAgentPolicy = asynHandler(async (req, res, next) => {
    // let userData = req.user;

    const tableName = 'policies';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdateFleetAgentPolicy = asynHandler(async (req, res, next) => {
    let payload = req.body;
    payload.last_updated = systemDate

    const runupdate = await GlobalModel.Update(payload, 'policies', 'policy_id', payload.policy_id)
    if (runupdate.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record Updated", runupdate.rows[0])


    } else {
        return sendResponse(res, 0, 200, "Update failed, please try later", [])
    }
})
exports.FindPolicyAndToken = asynHandler(async (req, res, next) => {
    let { policy_id } = req.body
    const tableName = 'policies';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
        { column: 'policy_id', operator: '=', value: policy_id },
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)

    const tableName2 = 'enrollment_tokens';
    const columnsToSelect2 = []; // Use string values for column names
    const conditions2 = [
        { column: 'policy_id', operator: '=', value: policy_id },
    ];
    let results2 = await GlobalModel.Finder(tableName2, columnsToSelect2, conditions2)
    if (results.rowCount == 1) {
        sendResponse(res, 1, 200, "Record Found", {policy:results.rows[0],etoken:results2.rows[0].token})
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }
})

/**
 * app versions

 */


exports.CreateEnrollmentToken = asynHandler(async (req, res, next) => {
    let payload = req.body;
    let results = await GlobalModel.Create(payload, 'enrollment_tokens', '');
    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record saved", [])
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})

exports.FindEnrollmentToken = asynHandler(async (req, res, next) => {
    let { application_id } = req.body
    const tableName = 'enrollment_tokens';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
        // { column: 'application_id', operator: '=', value: application_id },
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})


/**
 * app configuration templates

 */




