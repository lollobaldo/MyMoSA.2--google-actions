exports.handler = async (event, context) => {
  if (event.httpMethod === 'GET') {
    console.log('Requesting login page');
    return {
      statusCode: 200,
      body: `
        <html>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <body>
            <form action=".netlify/functions/login" method="post">
              <input type="hidden"
                name="responseurl" value="${event.queryStringParameters.responseurl}" />
              <button type="submit" style="font-size:14pt">
                Link this service to Google
              </button>
            </form>
          </body>
        </html>
      `,
    };
  }
  if (event.httpMethod === 'POST') {
    // Here, you should validate the user account.
    // In this sample, we do not do that.
    const responseurl = decodeURIComponent(event.body.responseurl);
    console.log(`Redirect to ${responseurl}`);
    // return event.redirect(responseurl);
    return {
      statusCode: 301,
      headers: {
        Location: responseurl,
      },
    };
  }
  // Unsupported method
  return {
    statusCode: 400,
    body: 'Method not allowed',
  };
};
