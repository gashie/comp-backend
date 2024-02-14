const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const GlobalModel = require("../../model/Global");
const { ShowLocationPolicies } = require("../../model/Location");
const systemDate = new Date().toISOString().slice(0, 19).replace("T", " ");

exports.CreateMonitors = asynHandler(async (req, res, next) => {
    try {
        /**
     * Create new monitor configuration.
     * @param {string} monitor_name - Name of the monitor.
     * @param {string} monitor_type - Type of the monitor configuration (e.g., HTTP, HTTPS).
     * @param {string} monitor_url - URL to monitor.
     * @param {string} monitor_host - Hostname for the monitor.
     * @param {number} monitor_port - Port number for the monitor.
     * @param {interval} monitor_frequency - Monitoring frequency (interval).
     * @param {number} timeout_seconds - Timeout duration in seconds.
     * @param {number} max_redirects - Maximum number of allowed redirects.
     * @param {string[]} locations - Array of locations associated with the monitor.
     * @param {boolean} enabled - Indicates whether the monitor is enabled.
     * @param {string[]} tags - Array of tags associated with the monitor.
     * @param {string} apm_service_name - Name of the associated Application Performance Monitoring (APM) service.
     * @param {string} data_stream_namespace - Namespace for data stream.
     * @param {string} username - Username for authentication.
     * @param {string} password - Password for authentication.
     * @param {string} proxy_url - URL of the proxy server.
     * @param {string} request_method - HTTP request method (e.g., GET, POST).
     * @param {Object} request_headers - JSON object containing HTTP request headers.
     * @param {string} request_body - Request body content.
     * @param {number[]} response_status_code - Array of expected HTTP response status codes.
     * @param {Object} response_headers - JSON object containing expected HTTP response headers.
     * @param {string[]} response_contains - Array of substrings expected in the response.
     * @param {string[]} response_does_not_contain - Array of substrings not expected in the response.
     * @param {Object} custom_tls_config - JSON object for custom TLS configuration.
     * @param {Date} created_at - Timestamp indicating the creation date (automatically set to UTC).
     * @param {Date} updated_at - Timestamp indicating the last update date (automatically set to UTC).
     * @param {string} push_type - Type of push service from the push configuration (e.g., restapi, rabbitmq).
     * @param {boolean} status_alert - Indicates whether the monitor should send alert notification right from fleet when application goes down.
     * @param {boolean} tls_alert - Indicates whether the monitor should send alert notification right from fleet when theres is tls cert error.

     */


        /*
        * Save monitors
        * Save monitor in monitor location
        * Save in main_queue
        * Save in right queue table and update main queue
        */
        let payload = req.body;
        if (payload.password) {
            payload.password = SimpleEncrypt(payload.password, payload.monitor_url)
        }
        let results = await GlobalModel.Create(payload, 'monitor_configs', '');
        //saving to location
        // let results_location = await GlobalModel.Create({ monitor_id: results.rows[0].monitor_id, location_id: payload.locations }, 'monitor_locations', '');
        // Save monitor locations
        const locations = payload.locations;
        const monitor_id=  results.rows[0].monitor_id;
        const locationPromises = locations.map(async (location) => {
            return GlobalModel.Create({
                monitor_id,
                location_id: location
            }, 'monitor_locations', '');
        });

        await Promise.all(locationPromises);
        //find respective push config
        const tableName = 'push_config';
        const columnsToSelect = []; // Use string values for column names
        const conditions = [
            { column: 'push_config_type', operator: '=', value: payload.push_type },
            { column: 'is_default', operator: '=', value: true },
        ];

        let findpush = await GlobalModel.Finder(tableName, columnsToSelect, conditions)
        if (findpush.rowCount == 0) {
            return sendResponse(res, 0, 200, "Monitor saved but no push service configured", [])

        }
        let main_queue_data = {
            push_config_id: findpush.rows[0].push_config_id,
            item_payload: payload,
            item_enc_key: payload.monitor_url,
            received_state: true,
            push_type: payload.push_type,
            monitor_id

        }
        let results_push = await GlobalModel.Create(main_queue_data, 'push_main_queue', '');
        if (results.rowCount == 1 && results_push.rowCount == 1) {
            return sendResponse(res, 1, 200, "New monitor added", results.rows[0])
        } else {
            return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

        }
    } catch (error) {
        console.error("Error in CreateMonitors:", error);
        return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])
    }

})

exports.ViewMonitors = asynHandler(async (req, res, next) => {
    let results = await ShowLocationPolicies();
    if (results.rows.length == 0) {
        return sendResponse(res, 0, 200, "Sorry, No Record Found", [])
    }

    sendResponse(res, 1, 200, "Record Found", results.rows)
})

exports.UpdateMonitors = asynHandler(async (req, res, next) => {
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
