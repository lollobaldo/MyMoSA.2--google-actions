const { smarthome } = require('actions-on-google');
const mqtt = require('async-mqtt');

// Hardcoded user ID
const USER_ID = '123';

const app = smarthome();

const devicesChannels = {
  'floor-lamp': 'lights/bulbs',
  'leds-light': 'lights/leds',
};

// eslint-disable-next-line no-mixed-operators
const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

app.onSync((body) => {
  console.log('syncing');
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: USER_ID,
      devices: [{
        id: 'floor-lamp',
        type: 'action.devices.types.LIGHT',
        traits: [
          'action.devices.traits.OnOff',
          'action.devices.traits.Brightness',
          'action.devices.traits.ColorSetting',
        ],
        name: {
          defaultNames: ['Leds'],
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
          commandOnlyOnOff: true,
          commandOnlyBrightness: true,
          commandOnlyColorSetting: true,
          colorTemperatureRange: {
            temperatureMinK: 2000,
            temperatureMaxK: 9000,
          },
        },
      }],
    },
  };
});

const queryDevice = async (deviceId) => {
  const data = { on: true, color: '#ffffff' };
  return {
    on: data.on,
    color: data.hex,
    brightness: 90,
  };
};

app.onQuery(async (body) => {
  const { requestId } = body;
  const payload = {
    devices: {},
  };
  const queryPromises = [];
  const intent = body.inputs[0];
  for (const device of intent.payload.devices) {
    const deviceId = device.id;
    queryPromises.push(
      queryDevice(deviceId)
        .then((data) => {
          // Add response to device payload
          payload.devices[deviceId] = data;
        }),
    );
  }
  // Wait for all promises to resolve
  await Promise.all(queryPromises);
  return {
    requestId,
    payload,
  };
});

const updateDevice = async (execution, deviceId, mqttClient) => {
  const { params, command } = execution;
  let state;
  let ref;
  switch (command) {
    case 'action.devices.commands.OnOff':
      try {
        await mqttClient.publish('lights/bulbs', params.on ? 'N255,0' : 'F255,0');
      } catch (e) {
        console.log(e.stack);
      }
      break;
    case 'action.devices.commands.BrightnessAbsolute':
      try {
        await mqttClient.publish('lights/bulbs', `N${params.brightness},0`);
      } catch (e) {
        console.log(e.stack);
      }
      break;
    case 'action.devices.commands.ColorAbsolute':
      try {
        const temp = map(params.color.temperatureK, 2000, 9000, 0, 255);
        await mqttClient.publish('lights/leds', `N255,${temp}`);
      } catch (e) {
        console.log(e.stack);
      }
      break;
    default:
  }
};

app.onExecute(async (body) => {
  console.log('onExecute');
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
      username: 'Djd77fBUcRepR3q1RveiU2sggtd1iDuLKvJIA8qANuOum4l3nn97dqbiJe9SFrre',
      port: 8883,
      clientId: `action-on-google--${Math.random().toString(16).substr(2, 8)}`,
    },
  );

  const executePromises = [];
  const intent = body.inputs[0];
  // intent.payload.commands.map
  for (const command of intent.payload.commands) {
    for (const device of command.devices) {
      for (const execution of command.execution) {
        executePromises.push(
          updateDevice(execution, device.id, client)
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
  console.log('done');
  // client.end(true);
  console.log('ended');
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
