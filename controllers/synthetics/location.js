const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const GlobalModel = require("../../model/Global");
const { autoProcessServiceToken } = require("../../helper/autoCreateEnrollment");
const { ShowLocationPolicies } = require("../../model/Location");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateLocationPolicy = asynHandler(async (req, res, next) => {
   /**
 * Create new location entry.
 * @param {string} location_name - Name of the location.
 * @param {string} location_description - Description of the location.
 * @param {number} latitude - Latitude coordinate of the location (numeric).
 * @param {number} longitude - Longitude coordinate of the location (numeric).
 * @param {uuid} policy_id - ID of the associated policy.
 * @param {string} location_type - Type or category of the location.
 */

    let payload = req.body;
    let results = await GlobalModel.Create(payload, 'locations', '');
    //setup location policy
    if (results.rowCount == 1) {
        return sendResponse(res, 1, 200, "New location added", results.rows[0])
    } else {
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    }

})

exports.ViewLocationPolicy = asynHandler(async (req, res, next) => {
    let results = await ShowLocationPolicies();
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdateLocationPolicy = asynHandler(async (req, res, next) => {
    let payload = req.body;
    payload.updated_at = systemDate

    const runupdate = await GlobalModel.Update(payload, 'locations', 'location_id', payload.location_id)
    if (runupdate.rowCount == 1) {
        return sendResponse(res, 1, 200, "Record Updated", runupdate.rows[0])


    } else {
        return sendResponse(res, 0, 200, "Update failed, please try later", [])
    }
})

/**
 * app versions

 */
