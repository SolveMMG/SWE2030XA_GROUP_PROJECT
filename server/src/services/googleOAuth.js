const https = require('https');

const requestJson = (url, options = {}, body) => new Promise((resolve, reject) => {
  const request = https.request(url, options, (response) => {
    let data = '';

    response.setEncoding('utf8');
    response.on('data', (chunk) => { data += chunk; });
    response.on('end', () => {
      let parsed;
      try {
        parsed = data ? JSON.parse(data) : {};
      } catch {
        return reject(new Error('Google returned an invalid JSON response'));
      }

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return reject(new Error(`Google request failed with status ${response.statusCode}`));
      }

      return resolve(parsed);
    });
  });

  request.on('error', reject);
  if (body) request.write(body);
  request.end();
});

const exchangeCode = (code) => {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    grant_type: 'authorization_code',
  }).toString();

  return requestJson('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
};

const fetchProfile = (accessToken) => requestJson(
  'https://www.googleapis.com/oauth2/v2/userinfo',
  { headers: { Authorization: `Bearer ${accessToken}` } },
);

module.exports = { exchangeCode, fetchProfile };
