const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const GlobalModel = require("../../model/Global");
const { autoProcessServiceToken } = require("../../helper/autoCreateEnrollment");
const { SimpleEncrypt } = require("../../helper/devicefuncs");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreatePushConfig = asynHandler(async (req, res, next) => {
    /**
     * Create new push configuration.
     * @param {string} push_config_name - Name of the push configuration.
     * @param {string} push_config_type - Type of the push configuration.
     * @param {string} push_config_url - URL for the push configuration.
     * @param {string} push_config_header - Header information for the push configuration.
     * @param {string} push_config_username - Username for authentication.
     * @param {string} push_config_password - Password for authentication.
     * @param {string} push_config_auth_token - Authentication token for the push configuration.
     * @param {string} push_config_payload - Payload information for the push configuration.
     * @param {boolean} push_config_state - State of the push configuration (true/false).
     */

    let payload = req.body;
    payload.push_config_password = SimpleEncrypt(payload.push_config_password, payload.push_config_username)
    payload.push_config_auth_token = SimpleEncrypt(payload.push_config_auth_token, payload.push_config_username)
    let results = await GlobalModel.Create(payload, 'push_config', '');
    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "New push config added")
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})

exports.ViewPushConfig = asynHandler(async (req, res, next) => {
    // let userData = req.user;

    const tableName = 'push_config';
    const columnsToSelect = []; // Use string values for column names
    const conditions = [
    ];
    let results = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdatePushConfig = asynHandler(async (req, res, next) => {
    let payload = req.body;
    payload.updated_at = systemDate

    if (payload.push_config_password) {
        payload.push_config_password = SimpleEncrypt(payload.push_config_password, payload.push_config_username)
    }

    if (payload.push_config_auth_token) {
        payload.push_config_auth_token = SimpleEncrypt(payload.push_config_auth_token, payload.push_config_username)
    }


    const runupdate = await GlobalModel.Update(payload, 'push_config', 'push_config_id', payload.push_config_id)
    if (runupdate.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record Updated", runupdate.rows[0])


    } else {
        return sendResponse(res, 0, 200, "Update failed, please try later", [])
    }
})

/**
 * app versions

 */
