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
    await client.publish('logs/action', 'connected');
    console.log('published');
    // This line doesn't run until the server responds to the publish
    await client.end();
    // This line doesn't run until the client has disconnected without error
    console.log('Done');
  } catch (e) {
    // Do something about it!
    console.log(e.stack);
    process.exit();
  }
};
