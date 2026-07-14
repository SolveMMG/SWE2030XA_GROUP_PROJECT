const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const pool = require('../db/pool');

passport.use(new GoogleStrategy({
  clientID:     process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL:  process.env.GOOGLE_CALLBACK_URL,
}, async (_accessToken, _refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value;
    const photo = profile.photos?.[0]?.value || null;

    const { rows } = await pool.query(
      `INSERT INTO users (google_id, name, email, photo_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (google_id) DO UPDATE
         SET name = EXCLUDED.name, photo_url = COALESCE(users.photo_url, EXCLUDED.photo_url),
             updated_at = NOW()
       RETURNING *, (xmax = 0) AS is_new_user`,
      [profile.id, profile.displayName, email, photo]
    );

    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
}));
