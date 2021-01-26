console.log('at least it opens');
const os = require('os');

console.log(os.cpus());

const mqtt = require('mqtt');

console.log('this one does work');

const devicesChannels = {
  'floor-lamp': 'lights/bulbs',
  'leds-light': 'lights/leds',
};

// const map = (value, lowFrom, highFrom, lowTo, highTo) => (
//   // eslint-disable-next-line no-mixed-operators
//   (value - lowFrom) * (highTo - lowFrom) / (highFrom - lowFrom) + lowTo
// );

// const asyncMsg = (client) => new Promise((resolve) => client.on('message', (_, msg) => resolve(msg.toString())));

// const message2state = (message) => {
//   if (message && (message.charAt(0) === 'N' || message.charAt(0) === 'F')) {
//     const [brightness, temperature] = message.substring(1).split(',').map(Number);
//     const state = message.charAt(0) === 'N';
//     return { state, brightness, temperature };
//   }
//   console.error('Invalid message');
//   return {};
// };

exports.handler = async function (event, context) {
  const client = await mqtt.connectAsync(
    'mqtts://mqtt.flespi.io', {
      username: 'Djd77fBUcRepR3q1RveiU2sggtd1iDuLKvJIA8qANuOum4l3nn97dqbiJe9SFrre',
      port: 8883,
      clientId: `action-on-google--${Math.random().toString(16).substr(2, 8)}`,
    },
  );
  await client.publish('lights/bulbs', 'N255,0');
  client.end();
  return { statusCode: 200, body: JSON.stringify(devicesChannels) };
};
