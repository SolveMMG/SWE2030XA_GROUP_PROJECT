const AppError = require('../utils/AppError');
const jwt = require('jsonwebtoken');
const { exchangeCode, fetchProfile } = require('../services/googleOAuth');
const userModel = require('../models/userModel');

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

const googleCallback = async (req, res, next) => {
  const { code } = req.query;

  if (!code) {
    return next(new AppError(400, 'OAUTH_CODE_MISSING', 'Google authorization code is required'));
  }

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    return next(new AppError(500, 'OAUTH_CONFIGURATION_ERROR', 'Google OAuth is not configured'));
  }

  let profile;
  try {
    const { access_token: accessToken } = await exchangeCode(code);
    if (!accessToken) throw new Error('Google did not return an access token');

    profile = await fetchProfile(accessToken);
    if (!profile.id || !profile.email) throw new Error('Google profile is missing required fields');
  } catch {
    return next(new AppError(401, 'OAUTH_AUTHENTICATION_FAILED', 'Google authentication failed'));
  }

  if (!process.env.JWT_SECRET) {
    return next(new AppError(500, 'JWT_CONFIGURATION_ERROR', 'JWT is not configured'));
  }

  try {
    const googleProfile = {
      googleId: profile.id,
      email: profile.email,
      name: profile.name || profile.email.split('@')[0],
      photoUrl: profile.picture,
      emailVerified: profile.verified_email === true,
    };
    let user = await userModel.findByGoogleId(googleProfile.googleId);
    if (!user) {
      user = await userModel.createFromGoogleProfile(googleProfile);
    }
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
    );

    return res.status(200).json({
      user,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 3600,
    });
  } catch {
    return next(new AppError(500, 'AUTHENTICATION_FAILED', 'Unable to complete authentication'));
  }
};

module.exports = { googleRedirect, googleCallback };
