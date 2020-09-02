const mqtt = require('async-mqtt');

exports.handler = async (event, context) => {
  console.log('starting');

  try {
    const client = await mqtt.connectAsync(
      'mqtts://mqtt.flespi.io', {
        username: 'Djd77fBUcRepR3q1RveiU2sggtd1iDuLKvJIA8qANuOum4l3nn97dqbiJe9SFrre',
        port: 8883,
        clientId: `action-on-google--${Math.random().toString(16).substr(2, 8)}`,
      },
    );
    console.log('connected');
    await client.publish('logs/action', `${67}`);
    console.log('published');
    await client.end();
    console.log('Done');
  } catch (e) {
    console.log(e.stack);
  }
};
