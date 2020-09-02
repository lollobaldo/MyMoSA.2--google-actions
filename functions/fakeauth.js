exports.handler = async (event, context) => {
  const responseurl = util.format('%s?code=%s&state=%s',
      decodeURIComponent(event.queryStringParameters.redirect_uri), 'xxxxxx',
      request.queryStringParameters.state);
  console.log(`Set redirect as ${responseurl}`);
  return {
    statusCode: 301,
    headers: {
      Location: `/login?responseurl=${encodeURIComponent(responseurl)}`,
    }
  };
});