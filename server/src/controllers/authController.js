const AppError = require('../utils/AppError');

const googleRedirect = (req, res, next) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_CALLBACK_URL;

  if (!clientId || !redirectUri) {
    return next(new AppError(
      500,
      'OAUTH_CONFIGURATION_ERROR',
      'Google OAuth is not configured',
    ));
  }

  const authorizationUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

  return res.redirect(302, authorizationUrl.toString());
};

module.exports = { googleRedirect };
