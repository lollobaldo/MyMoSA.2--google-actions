const mqtt = require('async-mqtt');

const asyncMsg = (client) => new Promise((resolve) => client.on('message', (_, msg) => resolve(msg)));

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
    client.subscribe('lights/bulbs');
    // client.on('message', (_, msg) => {
    //   console.log(msg.toString());
    //   return msg;
    // });
    const msg = await asyncMsg(client);
    console.log(msg.toString());
    client.end();
    console.log('Done');
  } catch (e) {
    console.log(e.stack);
  }
  return { statusCode: 200, body: 'HAeeoje' };
};
