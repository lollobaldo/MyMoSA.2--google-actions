// 'use strict';

// const functions = require('firebase-functions');
// const { smarthome } = require('actions-on-google');
// const {google} = require('googleapis');
// const util = require('util');
// const admin = require('firebase-admin');
// const mqtt = require('async-mqtt');

// // Initialize Firebase
// admin.initializeApp();
// const firebaseRef = admin.database().ref('/');
// // Initialize Homegraph
// const auth = new google.auth.GoogleAuth({
//   scopes: ['https://www.googleapis.com/auth/homegraph'],
// });
// const homegraph = google.homegraph({
//   version: 'v1',
//   auth: auth,
// });
// // Hardcoded user ID
// const USER_ID = '123';

// exports.login = functions.https.onRequest((request, response) => {
//   if (request.method === 'GET') {
//     functions.logger.log('Requesting login page');
//     response.send(`
//     <html>
//       <meta name="viewport" content="width=device-width, initial-scale=1">
//       <body>
//         <form action="/login" method="post">
//           <input type="hidden"
//             name="responseurl" value="${request.query.responseurl}" />
//           <button type="submit" style="font-size:14pt">
//             Link this service to Google
//           </button>
//         </form>
//       </body>
//     </html>
//   `);
//   } else if (request.method === 'POST') {
//     // Here, you should validate the user account.
//     // In this sample, we do not do that.
//     const responseurl = decodeURIComponent(request.body.responseurl);
//     functions.logger.log(`Redirect to ${responseurl}`);
//     return response.redirect(responseurl);
//   } else {
//     // Unsupported method
//     response.send(405, 'Method Not Allowed');
//   }
// });

// exports.fakeauth = functions.https.onRequest((request, response) => {
//   const responseurl = util.format('%s?code=%s&state=%s',
//       decodeURIComponent(request.query.redirect_uri), 'xxxxxx',
//       request.query.state);
//   functions.logger.log(`Set redirect as ${responseurl}`);
//   return response.redirect(
//       `/login?responseurl=${encodeURIComponent(responseurl)}`);
// });

// exports.faketoken = functions.https.onRequest((request, response) => {
//   const grantType = request.query.grant_type ?
//     request.query.grant_type : request.body.grant_type;
//   const secondsInDay = 86400; // 60 * 60 * 24
//   const HTTP_STATUS_OK = 200;
//   functions.logger.log(`Grant type ${grantType}`);

//   let obj;
//   if (grantType === 'authorization_code') {
//     obj = {
//       token_type: 'bearer',
//       access_token: '123access',
//       refresh_token: '123refresh',
//       expires_in: secondsInDay,
//     };
//   } else if (grantType === 'refresh_token') {
//     obj = {
//       token_type: 'bearer',
//       access_token: '123access',
//       expires_in: secondsInDay,
//     };
//   }
//   response.status(HTTP_STATUS_OK)
//       .json(obj);
// });

// const app = smarthome();

// app.onSync((body) => {
//   return {
//     requestId: body.requestId,
//     payload: {
//       agentUserId: USER_ID,
//       devices: [{
//         id: 'washer',
//         type: 'action.devices.types.LIGHT',
//         traits: [
//           'action.devices.traits.Brightness',
//           'action.devices.traits.ColorSetting',
//           'action.devices.traits.OnOff',
//           'action.devices.traits.LightEffects',
//         ],
//         name: {
//           defaultNames: ['My LEDs'],
//           name: 'Leds',
//           nicknames: ['Light', 'Lights', 'Led', 'Leds'],
//         },
//         deviceInfo: {
//           manufacturer: 'Lorenzo Baldini',
//           model: 'Leds-ESP-0.9',
//           hwVersion: '0.9',
//           swVersion: '0.9.0',
//         },
//         willReportState: false,
//         attributes: {
//           pausable: false,
//           commandOnlyColorSetting: true,
//         },
//       }],
//     },
//   };
// });

// app.onQuery(async (body) => {
//   return {};
// });



// const updateDevice = async (execution, deviceId) => {
//   const {params, command} = execution;
//   let state;
//   let ref;
//   switch (command) {
//     case 'action.devices.commands.OnOff':
//       state = {on: params.on};
//       ref = firebaseRef.child(deviceId).child('OnOff');
//       break;
//     case 'action.devices.commands.StartStop':
//       state = {isRunning: params.start};
//       ref = firebaseRef.child(deviceId).child('StartStop');
//       break;
//     case 'action.devices.commands.PauseUnpause':
//       state = {isPaused: params.pause};
//       ref = firebaseRef.child(deviceId).child('StartStop');
//       break;
//     default:
//       return;
//   }

//   return ref.update(state)
//       .then(() => state);
// };

// app.onExecute(async (body) => {
//   const {requestId} = body;
//   // Execution results are grouped by status
//   const result = {
//     ids: [],
//     status: 'SUCCESS',
//     states: {
//       online: true,
//     },
//   };

//   const client = await mqtt.connectAsync(
//     'mqtts://mqtt.flespi.io', {
//       username: '6j7r0OrwO8ReQmZk0ZszVe6hvAB8IS4E1ZUPBbbe7QiN28VQVddEg9LBxay3QqyF',
//       port: 443,
//   });
  
//   await client.publish('logs', 'connected');

//   const executePromises = [];
//   const intent = body.inputs[0];
//   for (const command of intent.payload.commands) {
//     for (const device of command.devices) {
//       for (const execution of command.execution) {
//         executePromises.push(
//           updateDevice(execution, device.id)
//             .then((data) => {
//               result.ids.push(device.id);
//               Object.assign(result.states, data);
//             })
//             .catch(() => functions.logger.error('EXECUTE', device.id)));
//       }
//     }
//   }

//   await Promise.all(executePromises);
//   return {
//     requestId: requestId,
//     payload: {
//       commands: [result],
//     },
//   };
// });


// app.onDisconnect((body, headers) => {
//   functions.logger.log('User account unlinked from Google Assistant');
//   // Return empty response
//   return {};
// });

// exports.smarthome = functions.https.onRequest(app);

// exports.requestsync = functions.https.onRequest(async (request, response) => {
//   response.set('Access-Control-Allow-Origin', '*');
//   functions.logger.info(`Request SYNC for user ${USER_ID}`);

//   // TODO: Call HomeGraph API for user '123'
//   response.status(500).send(`Request SYNC not implemented`);
// });

// /**
//  * Send a REPORT STATE call to the homegraph when data for any device id
//  * has been changed.
//  */
// exports.reportstate = functions.database.ref('{deviceId}').onWrite(
//     async (change, context) => {
//       functions.logger.info('Firebase write event triggered Report State');

//       // TODO: Get latest state and call HomeGraph API
//     });

