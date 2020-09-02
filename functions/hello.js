exports.handler = async (event, context) => {
  console.log('lg1');
  return {
    statusCode: 200,
    body: 'Hello, World',
  };
};
