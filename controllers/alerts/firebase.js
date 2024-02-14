const asynHandler = require("../../middleware/async");
const { sendResponse, CatchHistory } = require("../../helper/utilfunc");
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" })
const GlobalModel = require("../../model/Global");
const {initializeApp,applicationDefault} = require("firebase-admin/app");
const {getMessaging} = require("firebase-admin/messaging")
var serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

exports.CreateFireBaseAlert = asynHandler(async (req, res, next) => {
    /**
 * Create new role.
 * @param {string} location_name - Name or title of the application.
 * @param {string} location_description - Description: Managerial role.
 *  * @param {uuid} policy_id - Description: 12ds-2-21212.
 */
    let payload = req.body;
    // let results = await GlobalModel.Create(payload, 'fleets', '');
    // let { service_token, fleet_id } = await autoProcessServiceToken(req, results.rows)

    // if (results.rowCount == 1) {
    //     return sendResponse(res, 1, 200, "New fleet added", { service_token, fleet_id, ...req.body })
    // } else {
    //     return sendResponse(res, 0, 200, "Sorry, error saving record: contact administrator", [])

    // }
   

initializeApp({
  credential: applicationDefault(),
  projectId:"be360"
});

const message = {
    notification: {
      title: "Notif",
      body: 'This is a Test Notification'
    },
    token: "YOUR FCM TOKEN HERE",
  };
  
  getMessaging()
    .send(message)
    .then((response) => {
      res.status(200).json({
        message: "Successfully sent message",
        token: receivedToken,
      });
      console.log("Successfully sent message:", response);
    })
    .catch((error) => {
      res.status(400);
      res.send(error);
      console.log("Error sending message:", error);
    });
  
  

})
