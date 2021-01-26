const mqtt = require('async-mqtt');

const devicesChannels = {
  'floor-lamp': 'lights/bulbs',
  'leds-light': 'lights/leds',
};

exports.handler = async function (event, context) {
  const client = await mqtt.connectAsync(
    'mqtts://mqtt.flespi.io', {
      username: 'Djd77fBUcRepR3q1RveiU2sggtd1iDuLKvJIA8qANuOum4l3nn97dqbiJe9SFrre',
      port: 8883,
      clientId: `action-on-google--${Math.random().toString(16).substr(2, 8)}`,
    },
  );
  await client.publish('lights/bulbs', 'N0,0');
  client.end();
  return { statusCode: 200, body: 'Successfull' };
};
