const { smarthome } = require('actions-on-google');
const mqtt = require('async-mqtt');

// Hardcoded user ID
const USER_ID = '123';

const app = smarthome();

app.onSync((body) => {
  console.log('syncing');
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: USER_ID,
      devices: [{
        id: 'washer',
        type: 'action.devices.types.LIGHT',
        traits: [
          'action.devices.traits.Brightness',
          'action.devices.traits.ColorSetting',
          'action.devices.traits.OnOff',
          'action.devices.traits.LightEffects',
        ],
        name: {
          defaultNames: ['My LEDs'],
          name: 'Leds',
          nicknames: ['Light', 'Lights', 'Led', 'Leds'],
        },
        deviceInfo: {
          manufacturer: 'Lorenzo Baldini',
          model: 'Leds-ESP-0.9',
          hwVersion: '0.9',
          swVersion: '0.9.0',
        },
        willReportState: false,
        attributes: {
          pausable: false,
          commandOnlyColorSetting: true,
        },
      }],
    },
  };
});

app.onQuery(async (body) => {});

const updateDevice = async (execution, deviceId) => {
  const { params, command } = execution;
  let state;
  let ref;
  switch (command) {
    case 'action.devices.commands.OnOff':
      console.log('On');
      break;
    case 'action.devices.commands.StartStop':
      console.log('start');
      break;
    case 'action.devices.commands.PauseUnpause':
      console.log('pause');
      break;
    default:
  }
};

app.onExecute(async (body) => {
  const { requestId } = body;
  // Execution results are grouped by status
  const result = {
    ids: [],
    status: 'SUCCESS',
    states: {
      online: true,
    },
  };

  const client = await mqtt.connectAsync(
    'mqtts://mqtt.flespi.io', {
      username: '6j7r0OrwO8ReQmZk0ZszVe6hvAB8IS4E1ZUPBbbe7QiN28VQVddEg9LBxay3QqyF',
      port: 443,
    },
  );

  await client.publish('logs', 'connected');

  const executePromises = [];
  const intent = body.inputs[0];
  // intent.payload.commands.map
  for (const command of intent.payload.commands) {
    for (const device of command.devices) {
      for (const execution of command.execution) {
        executePromises.push(
          updateDevice(execution, device.id)
            .then((data) => {
              result.ids.push(device.id);
              Object.assign(result.states, data);
            })
            .catch(() => console.error('EXECUTE', device.id)),
        );
      }
    }
  }

  await Promise.all(executePromises);
  return {
    requestId,
    payload: {
      commands: [result],
    },
  };
});

app.onDisconnect((body, headers) => {
  console.log('User account unlinked from Google Assistant');
  // Return empty response
  return {};
});

exports.handler = app;
