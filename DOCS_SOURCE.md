# SkillSwap — Documentation Source Material

Extracted directly from repo code, config, and git history. `not found in repo` marks anything that genuinely isn't determinable from the codebase.

---

## 1. Team & Roles

### Raw contributor data

`git shortlog -sne --all`:

```
    42  Michael Gacheru <mikachupichu@gmail.com>
    17  Michael Muraya <144103898+SolveMMG@users.noreply.github.com>
     9  Kyle <kylekiimani@gmail.com>
     7  Robert <robertmwai28@gmail.com>
     3  Your Name <robertmwai28@gmail.com>
     2  SolveMMG <mikachupichu@gmail.com>
     2  l3shan <leshansantana@gmail.com>
     1  13shan <leshansantana@gmail.com>
     1  bxmbaa <getumaeugene@gmail.com>
```

Several rows are the same human under different git identities (same email, different configured name):
- `Michael Gacheru` / `SolveMMG` → `mikachupichu@gmail.com` (also the current logged-in user, confirmed via `userEmail` context)
- `Robert` / `Your Name` → `robertmwai28@gmail.com`
- `l3shan` / `13shan` → `leshansantana@gmail.com`

Branches in the repo (`git branch -a`): `main`, `michael` (current), `Robert-M`, `gael`, plus remotes `Eugene-Getuma`, `Kyle`, `feature/frontend-marketplace-inquiries`, `leshan`, `master`.

### Inferred roles by area (sampled via `git log --author --oneline` and `--name-only`)

| Identity | Email | Branch(es) worked on | Area (by files touched) | Sample commits |
|---|---|---|---|---|
| Michael Gacheru | mikachupichu@gmail.com | `michael` (current) | Full-stack: auth hardening, all server routes, DB, middleware, client pages/components, tests, CI/CD | "Rework OAuth token handoff to close a token-leak and CSRF-adjacent exposure", "Harden API surface and remove dead scaffolding", "Add Render Blueprint for first-time deploy, gate CD on CI passing", "feat: implement authentication and authorization middleware" |
| Michael Muraya (SolveMMG) | 144103898+SolveMMG@users.noreply.github.com | `master`→`main` | Repo owner/integrator — initial scaffold, README, LICENSE, merging PRs from teammate branches into `main` | "Initial commit", "Adding basic structure for apps", "Adding docker and github actions", merge-PR commits (#1–#14) |
| Kyle | kylekiimani@gmail.com | `Kyle` | Early client scaffolding — design tokens, component library, routing map, App layout, login page, auth context, profile pages | "Design tokens", "Reusable component library", "Routing map + ProtectedRoute", "App layout", "Login page with Google button wired to /auth/google", "Auth context", "Profile page", "Profile edit" |
| Robert / Your Name | robertmwai28@gmail.com | `Robert-M` | Backend auth subsystem — Google OAuth callback, JWT issuance, refresh-token rotation, logout, rate limiting, auth tests | "Add JWT token generation and error handling in Google OAuth callback", "Implement refresh token functionality and update authentication flow", "Refactor authentication middleware to improve token validation and user extraction", "Implement logout functionality to revoke refresh tokens and add related tests", "Add cleanup for expired refresh tokens in authentication flow", "Add rate limiting and security headers to authentication routes", "Add integration tests for Google authentication flow and token management" |
| l3shan / 13shan | leshansantana@gmail.com | `leshan`, contributions to `main` | Marketplace/inquiries UI, README contributor list | "feat: marketplace and inquiries UI", "docs: add/update l3shan to contributors list" |
| bxmbaa | getumaeugene@gmail.com | `Eugene-Getuma` | Reviews API | "feat: implement reviews API with validation" |

### Important nuance for documentation

- `main` (local) **does** contain merged-in work from Kyle, Robert-M, gael, and Eugene-Getuma branches (verified: all three are ancestors of local `main` except `leshan` and `master`, which are not).
- The current working branch **`michael`** (source of this documentation task, per project memory "PRs to main") diverged from `main` and is **not** a descendant of `main` — `git merge-base --is-ancestor main michael` returns false and vice versa. Diffing `main` vs `michael` shows `michael` replaced the client's `routes/` folder and old auth wiring with a rebuilt version, added `userValidators.js`, rewrote `ProfilePage.jsx`, and reworked `server/package.json`/`server/.env.example`. In short: **the code actually described in this documentation (client `michael` branch) is substantially Michael Gacheru's rebuild/hardening on top of the team's earlier `main` work**, not a verbatim snapshot of every teammate's original commits. Worth deciding explicitly how to credit this in the docs.
- Team member full names/student IDs/roles beyond git identity: **not found in repo.**

---

## 2. Technology Stack

### Backend — `server/package.json`

**Dependencies:**
| Package | Version |
|---|---|
| cloudinary | ^2.5.1 |
| cookie-parser | ^1.4.6 |
| cors | ^2.8.5 |
| dotenv | ^16.4.5 |
| express | ^4.19.2 |
| express-rate-limit | ^7.4.0 |
| express-validator | ^7.2.0 |
| helmet | ^8.0.0 |
| jsonwebtoken | ^9.0.2 |
| multer | ^1.4.5-lts.1 |
| nodemailer | ^6.9.15 |
| passport | ^0.7.0 |
| passport-google-oauth20 | ^2.0.0 |
| pg | ^8.12.0 |
| uuid | ^10.0.0 |

**devDependencies (includes test frameworks):**
| Package | Version |
|---|---|
| @eslint/js | ^9.0.0 |
| eslint | ^9.0.0 |
| globals | ^16.0.0 |
| **jest** | **^29.7.0** |
| nodemon | ^3.1.0 |
| **supertest** | **^7.0.0** |

Jest config (inline in package.json): `testEnvironment: node`, matches `**/tests/**/*.test.js` and `**/__tests__/**/*.test.js`, with `globalSetup`/`globalTeardown` at `./tests/globalSetup.js` / `globalTeardown.js`.

Note: no `bcrypt`/`bcryptjs` dependency exists despite the README's tech-stack table listing "Bcrypt" — auth is Google OAuth + JWT only, no password hashing in code (see §12).

### Frontend — `client/package.json`

**Dependencies:**
| Package | Version |
|---|---|
| axios | ^1.7.0 |
| react | ^18.2.0 |
| react-dom | ^18.2.0 |
| react-router-dom | ^6.26.0 |

**devDependencies (includes test frameworks):**
| Package | Version |
|---|---|
| autoprefixer | ^10.4.0 |
| postcss | ^8.4.0 |
| tailwindcss | ^3.4.0 |
| @eslint/js | ^9.0.0 |
| @testing-library/jest-dom | ^6.0.0 |
| @testing-library/react | ^16.0.0 |
| @testing-library/user-event | ^14.0.0 |
| @vitejs/plugin-react | ^4.0.0 |
| eslint | ^9.0.0 |
| eslint-plugin-react | ^7.37.0 |
| eslint-plugin-react-hooks | ^5.0.0 |
| globals | ^16.0.0 |
| jsdom | ^25.0.0 |
| **vite** | **^6.0.0** |
| **vitest** | **^3.0.0** |

### DevOps tooling confirmed present in repo
- `server/Dockerfile` — multi-stage (`development` / `builder` / `production`), Node 20-alpine, production stage runs `node src/index.js` on port 5000.
- `client/Dockerfile` — multi-stage (`development` / `builder` / `production`), production stage builds with Vite then serves via `nginx:alpine` on port 80, using `client/nginx.conf`.
- `docker-compose.yml` — 3 services: `db` (postgres:15-alpine), `server`, `client`, with a Postgres healthcheck gate before the server starts.
- `.github/workflows/ci.yml` and `.github/workflows/cd.yml` — see §9.
- `render.yaml` — Render Blueprint (Infrastructure-as-Code) provisioning `skillswap-db`, `skillswap-server`, `skillswap-client`.

---

## 3. System Architecture

### Backend folder structure (`server/src/`)

```
server/src/
├── app.js                 # Express app assembly: middleware chain + route mounting
├── index.js                # Entry point: loads .env, starts HTTP listener
├── controllers/            # empty (.gitkeep only) — no controller layer; logic lives in route files
├── db/
│   ├── pool.js              # pg Pool, reads DATABASE_URL
│   ├── migrate.js           # migration runner (see §4)
│   ├── seed.js              # dev seed data
│   └── migrations/          # 001–007 numbered .sql files (the live, actually-used schema)
├── middleware/
│   ├── auth.js               # requireAuth — Bearer JWT verification
│   ├── errorHandler.js       # central error handler
│   ├── validate.js           # express-validator result → 400 JSON
│   └── userValidators.js     # UUID/snake_case validators — NOT wired into any route (dead code, see §12)
├── models/                 # empty (.gitkeep only) — no ORM/model layer; raw SQL in route files
├── routes/
│   ├── auth.js, users.js, listings.js, uploads.js, inquiries.js, reviews.js
├── services/
│   ├── passport.js           # Google OAuth strategy + upsert-on-login
│   └── email.js              # Nodemailer transporter + 2 email templates
├── utils/
│   └── jwt.js                # access/refresh token sign/verify, refresh expiry, token hashing
└── __tests__/
    └── app.test.js            # single health-check test (separate from server/tests/)
```

There is also a **second, unused** `server/migrations/` directory (JS, `node-pg-migrate` style) at the repo root of `server/` — see §4 and §12.

### Auth state / middleware order (from `server/src/app.js`)

```js
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));   // global API rate limit
app.use('/api/v1/auth',      require('./routes/auth'));
app.use('/api/v1/users',     require('./routes/users'));
app.use('/api/v1/listings',  require('./routes/listings'));
app.use('/api/v1/uploads',   require('./routes/uploads'));
app.use('/api/v1/inquiries', require('./routes/inquiries'));
app.use('/api/v1/reviews',   require('./routes/reviews'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);
```

Auth state is stateless JWT (no server-side session store, `passport.authenticate(..., { session: false })` everywhere). Per-request auth is enforced by the `requireAuth` middleware (`server/src/middleware/auth.js`), applied selectively per-route (not globally) — it reads `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, and attaches the decoded payload to `req.user`.

The `auth` route itself layers an extra `authLimiter` (`express-rate-limit`, 50 req/15 min) on top of the global 300 req/15 min API limiter.

### Third-party integrations and where they're invoked

| Integration | Package | Invoked from |
|---|---|---|
| Google OAuth 2.0 | `passport-google-oauth20` | `server/src/services/passport.js` (strategy config + user upsert), routed via `server/src/routes/auth.js` (`GET /google`, `GET /google/callback`) |
| Image upload / CDN | `cloudinary` | `server/src/routes/uploads.js` — `cloudinary.config()` at module load, `cloudinary.uploader.upload_stream()` in the `POST /image` handler |
| Transactional email | `nodemailer` | `server/src/services/email.js` — `nodemailer.createTransport()`; called from `server/src/routes/inquiries.js` (`sendInquiryNotification`, `sendInquiryStatusUpdate`), fire-and-forget (`.catch(console.error)`, doesn't block the response) |
| File parsing (multipart) | `multer` | `server/src/routes/uploads.js` — in-memory storage, 5 MB limit, jpg/png/webp mimetype filter |
| JWT | `jsonwebtoken` | `server/src/utils/jwt.js` |

---

## 4. Database Schema

Read in order from `server/src/db/migrations/*.sql` (the live schema; run via `npm run migrate`):

### `001_create_schema_migrations.sql`
```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `002_create_users.sql`
```sql
CREATE TABLE IF NOT EXISTS users (
  id         SERIAL PRIMARY KEY,
  google_id  TEXT UNIQUE NOT NULL,
  name       TEXT NOT NULL,
  email      TEXT UNIQUE NOT NULL,
  bio        TEXT,
  skills     TEXT[] DEFAULT '{}',
  photo_url  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### `003_create_listings.sql`
```sql
CREATE TABLE IF NOT EXISTS listings (
  id          SERIAL PRIMARY KEY,
  seller_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  category    TEXT NOT NULL CHECK (category IN ('design','programming','writing','tutoring','music','photography','other')),
  price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  image_url   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS listings_seller_id_idx ON listings(seller_id);
CREATE INDEX IF NOT EXISTS listings_category_idx ON listings(category);
```

### `004_create_inquiries.sql`
```sql
CREATE TABLE IF NOT EXISTS inquiries (
  id         SERIAL PRIMARY KEY,
  listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS inquiries_listing_id_idx ON inquiries(listing_id);
CREATE INDEX IF NOT EXISTS inquiries_buyer_id_idx ON inquiries(buyer_id);
```

### `005_create_reviews.sql`
```sql
CREATE TABLE IF NOT EXISTS reviews (
  id          SERIAL PRIMARY KEY,
  inquiry_id  INT UNIQUE NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  reviewer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reviews_seller_id_idx ON reviews(seller_id);
```
Note: `inquiry_id UNIQUE` is the duplicate-review guard at the DB level (one review per inquiry), enforced additionally in application code (§5).

### `006_create_auth_tokens.sql`
```sql
CREATE TABLE IF NOT EXISTS auth_tokens (
  id            SERIAL PRIMARY KEY,
  user_id       INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_tokens_user_id_idx ON auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS auth_tokens_refresh_token_idx ON auth_tokens(refresh_token);
```
Stores a **SHA-256 hash** of each refresh token (see §7), not the raw token.

### `007_listings_search_trgm_index.sql`
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX IF NOT EXISTS listings_title_trgm_idx ON listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS listings_description_trgm_idx ON listings USING GIN (description gin_trgm_ops);
```
Trigram indexes to speed up the `ILIKE` search used in `GET /api/v1/listings?search=`.

### Migration runner (`server/src/db/migrate.js`)

Custom hand-rolled runner (no external migration framework for the live schema):
1. Loads `.env`.
2. Ensures `schema_migrations` tracking table exists.
3. Reads all `*.sql` files in `server/src/db/migrations/`, sorted by filename.
4. Diffs against `filename`s already recorded in `schema_migrations`.
5. For each unapplied file: wraps in `BEGIN`/`COMMIT`, runs the raw SQL, records the filename.
6. On any failure: `ROLLBACK`, logs, `process.exit(1)`.

Invoked via `npm run migrate` → `node src/db/migrate.js`. Also run automatically by Render before every deploy via `preDeployCommand: npm run migrate` in `render.yaml`.

---

## 5. Key Features (by route file, plain language)

### `auth.js` — Google OAuth + JWT session management
- Kicks off Google sign-in, handles the OAuth callback, upserts the user, issues a short-lived one-time exchange code (rather than putting tokens directly in the redirect URL), lets the SPA trade that code for a real access token + refresh cookie, and supports refresh/logout.

### `users.js` — Profile management
- Get your own profile (with aggregated rating stats), update your own profile, view someone else's public profile (email/google_id stripped), delete your own account.

### `listings.js` — Marketplace listings CRUD
- Browse/search/filter/paginate listings (public), create a listing (auth required), view one listing with embedded seller info + rating, update/delete a listing — **ownership-checked**.

### `inquiries.js` — Buyer↔seller messaging/negotiation
- Buyer sends an inquiry on a listing (triggers an email to the seller), list your inquiries (sent or received, filterable by status), seller accepts/declines a pending inquiry (triggers a status-update email to the buyer).

### `reviews.js` — Post-transaction ratings
- Buyer leaves a 1–5 star rating + optional comment on an accepted inquiry; public read of a seller's aggregated rating + review list.

### `uploads.js` — Image hosting
- Authenticated single-image upload (jpg/png/webp, ≤5MB) streamed straight to Cloudinary; returns the resulting secure URL for use as a listing/profile image.

### Business-rule checks found in code (quoted verbatim)

| Rule | File | Condition |
|---|---|---|
| Can't inquire on your own listing | `inquiries.js` | `if (listing.seller_id === req.user.userId) { return res.status(400).json({ error: { code: 'OWN_LISTING', ... } }); }` |
| Only the listing owner can accept/decline | `inquiries.js` | `if (inquiry.seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your inquiry to manage' } });` |
| Can only act on a pending inquiry | `inquiries.js` | `if (inquiry.status !== 'pending') return res.status(409).json({ error: { code: 'NOT_PENDING', message: 'Inquiry is not pending' } });` |
| Only the buyer can review | `reviews.js` | `if (inquiry.buyer_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Only the buyer can leave a review' } });` |
| Review requires an accepted inquiry | `reviews.js` | `if (inquiry.status !== 'accepted') return res.status(403).json({ error: { code: 'NOT_ACCEPTED', message: 'Inquiry must be accepted before reviewing' } });` |
| No duplicate reviews per inquiry | `reviews.js` | `if (existing.length) return res.status(409).json({ error: { code: 'ALREADY_REVIEWED', message: 'This inquiry already has a review' } });` (backed by the DB `UNIQUE (inquiry_id)` constraint) |
| Only listing owner can edit | `listings.js` | `if (existing[0].seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your listing' } });` |
| Only listing owner can delete | `listings.js` | `if (rows[0].seller_id !== req.user.userId) return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Not your listing' } });` |
| Refresh token single-use (rotation) | `auth.js` | `await pool.query('DELETE FROM auth_tokens WHERE id = $1', [rows[0].id]);` immediately after successful verification, before issuing a new pair |
| One-time OAuth exchange code | `auth.js` | `pendingAuth.delete(req.body.code)` on first use; 60-second TTL enforced via `if (entry.expiresAt < Date.now())` |

---

## 6. API Reference

Router prefix for everything except `/api/health` is `/api/v1` (mounted in `app.js`).

### Auth — `/api/v1/auth` (all routes pass through `authLimiter`, 50 req/15 min)
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/google` | — | — (Passport redirect to Google, `scope: ['profile','email']`) |
| GET | `/google/callback` | — | — (Passport callback; redirects to client) |
| POST | `/exchange` | — | `{ code }` |
| POST | `/refresh` | reads `refreshToken` httpOnly cookie | — |
| POST | `/logout` | reads `refreshToken` cookie (optional) | — |

### Users — `/api/v1/users`
| Method | Path | Auth | Body |
|---|---|---|---|
| GET | `/me` | requireAuth | — |
| PUT | `/me` | requireAuth | `{ name?, bio?, skills?, photoUrl? }` |
| GET | `/:id` | — | — |
| DELETE | `/me` | requireAuth | — |

### Listings — `/api/v1/listings`
| Method | Path | Auth | Body / Query |
|---|---|---|---|
| GET | `/` | — | query: `page?, limit?, search?, category?, sellerId?` |
| POST | `/` | requireAuth | `{ title, description, category, price, imageUrl? }` |
| GET | `/:id` | — | — |
| PUT | `/:id` | requireAuth + ownership | `{ title?, description?, category?, price?, imageUrl? }` |
| DELETE | `/:id` | requireAuth + ownership | — |

### Inquiries — `/api/v1/inquiries`
| Method | Path | Auth | Body / Query |
|---|---|---|---|
| POST | `/` | requireAuth | `{ listingId, message }` |
| GET | `/` | requireAuth | query: `role? (sent|received), status? (pending|accepted|declined)` |
| PATCH | `/:id/accept` | requireAuth + ownership + pending-only | — |
| PATCH | `/:id/decline` | requireAuth + ownership + pending-only | — |

### Reviews — `/api/v1/reviews`
| Method | Path | Auth | Body / Query |
|---|---|---|---|
| POST | `/` | requireAuth + buyer-only + accepted-only | `{ inquiryId, rating, comment? }` |
| GET | `/` | — | query: `sellerId` (required) |

### Uploads — `/api/v1/uploads`
| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/image` | requireAuth | multipart form, field `image` |

### Misc
| Method | Path | Auth |
|---|---|---|
| GET | `/api/health` | — (returns `{ status: 'ok' }`, no `/v1` prefix) |

### Central error handler

`server/src/middleware/errorHandler.js`:
```js
function errorHandler(err, req, res, _next) {
  console.error(err);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
}
```
Catches anything passed to `next(err)` and always responds `500 { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } }` — it does not differentiate error types (e.g. a DB constraint violation and an unhandled exception both surface identically).

**Error response shape is consistent across the whole codebase**: `{ error: { code: STRING, message: STRING } }`. Status codes observed in route handlers: `400` (validation, bad OAuth code, own-listing inquiry), `401` (missing/invalid/expired token, no/invalid refresh cookie), `403` (forbidden/ownership, non-buyer review, non-accepted inquiry), `404` (not found: user/listing/inquiry), `409` (conflict: inquiry not pending, already reviewed, rotated/reused refresh token), `500` (uncaught, via `errorHandler`). Validation errors specifically use `code: 'VALIDATION_ERROR'` from `middleware/validate.js`.

---

## 7. Authentication Flow

### End-to-end login trace

1. **Client** → `GET /api/v1/auth/google` (simple link, e.g. from `LoginPage`) → Passport's Google strategy redirects the browser to Google's consent screen (`scope: ['profile', 'email']`, `session: false`).
2. **Google** redirects back to `GET /api/v1/auth/google/callback`.
3. Passport's verify callback (`server/src/services/passport.js`) upserts the user:
   ```sql
   INSERT INTO users (google_id, name, email, photo_url) VALUES (...)
   ON CONFLICT (google_id) DO UPDATE SET name=..., photo_url=COALESCE(...), updated_at=NOW()
   RETURNING *, (xmax = 0) AS is_new_user
   ```
   (`xmax = 0` is the Postgres trick used to detect "was this an INSERT or an UPDATE".)
4. Back in the route handler (`auth.js`): signs an access token (`signAccess`) and a refresh token (`signRefresh`), inserts the **hashed** refresh token into `auth_tokens`, generates a random one-time `code` (`crypto.randomBytes(24).toString('hex')`), stashes `{ token, refreshToken, user }` in an in-memory `Map` (`pendingAuth`) keyed by that code with a 60-second TTL, and redirects the browser to `${CLIENT_URL}/auth/callback?code=...` — **no tokens ever appear in the URL**.
5. **Client** (`AuthCallbackPage.jsx`) reads `?code=`, `POST`s it to `/auth/exchange`.
6. **Server** (`POST /exchange`) looks up the code in `pendingAuth`, deletes it (one-time use), checks TTL, sets the refresh token as an httpOnly cookie, and returns `{ token, user }` in the JSON body.
7. **Client** calls `login(user, token)` (AuthContext) → stores `token` and `user` in `localStorage`, then navigates to `/profile` if `user.isNewUser` else `/`.

### Refresh token logic
- Expiry: **30 days** (`REFRESH_EXPIRY_DAYS = 30` in `utils/jwt.js`), both in the JWT's own `expiresIn` and the `expires_at` column value.
- Storage: `auth_tokens` table, storing `sha256(refreshToken)` (via `hashToken()`), never the raw token.
- Rotation: `POST /auth/refresh` verifies the JWT signature+expiry, looks up the hash in `auth_tokens` (`AND expires_at > NOW()`), **deletes that row immediately** ("Rotate" comment in code), then issues and stores a brand-new access+refresh pair. Reusing an old (already-rotated) refresh token fails the DB lookup → `401 TOKEN_REVOKED`.
- Cookie flags: `httpOnly: true`, `path: '/api/v1/auth'`, `secure`/`sameSite` conditional on `NODE_ENV === 'production'` (`secure:true, sameSite:'none'` in prod for the cross-subdomain Render deployment; `secure:false, sameSite:'lax'` locally) — documented inline as intentional.
- Logout (`POST /auth/logout`): deletes the matching `auth_tokens` row by hash and clears the cookie; no-ops safely if no cookie is present.
- No scheduled/cron cleanup of expired-but-undeleted `auth_tokens` rows found in the live code (Robert's branch had a "cleanup for expired refresh tokens" commit, but that work is on the unmerged `Robert-M` branch relative to `michael` — see caveat in §1/§12).

### Frontend auth context / interceptor (`client/src/api/index.js`, `client/src/context/AuthContext.jsx`)
- Axios instance with `baseURL = VITE_API_URL + '/v1'`, `withCredentials: true` (so the httpOnly refresh cookie is sent automatically).
- Request interceptor: reads `token` from `localStorage`, sets `Authorization: Bearer <token>` on every outgoing request.
- Response interceptor: on a `401` that hasn't already been retried (`!original._retry`), calls `POST /auth/refresh` (with credentials), stores the new access token, retries the original request. Concurrent 401s are coalesced via a `refreshing` flag + `waitQueue` so only one refresh call fires. If the refresh call itself fails: clears `localStorage` and hard-redirects to `/login`.
- `AuthContext` exposes `user`, `isAuthenticated`, `login(userData, token)`, `logout()` (calls `POST /auth/logout`, best-effort, then clears local state regardless), `updateUser(updates)` (patches localStorage + state).

---

## 8. Testing

### Backend (`server/tests/*.test.js` + `server/src/__tests__/app.test.js`) — Jest + Supertest, 46 `it`/`test` blocks total

| File | Describe blocks | Test count |
|---|---|---|
| `auth.test.js` | `POST /api/v1/auth/exchange`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout` | 8 |
| `listings.test.js` | `Listings CRUD` | 6 |
| `inquiries.test.js` | `Inquiry flow`, `Review eligibility` | 7 |
| `listings.browse.test.js` | `GET /api/v1/listings` | 8 |
| `reviews.test.js` | `GET /api/v1/reviews`, `POST /api/v1/reviews (validation)` | 6 |
| `users.test.js` | `GET /api/v1/users/me`, `PUT /api/v1/users/me`, `GET /api/v1/users/:id`, `DELETE /api/v1/users/me` | 10 |
| `src/__tests__/app.test.js` | (ungrouped) | 1 |

Representative coverage: exchange-code validation, refresh rotation + reuse rejection, logout idempotency, listing CRUD + ownership enforcement, search/filter/pagination edge cases, inquiry status transitions and review-eligibility gating, review validation (rating range, accepted-only), profile field COALESCE-preserving updates, `google_id` stripped from responses.

Uses `globalSetup.js` / `globalTeardown.js` (likely DB provisioning/teardown — files exist but weren't read in depth here; confirm content if needed for docs).

### Frontend (`client/src/**/__tests__/*.test.jsx` + `App.test.jsx`) — Vitest + Testing Library, 42 `test` blocks total

| File | Test count | Covers |
|---|---|---|
| `App.test.jsx` | 2 | Navbar brand render, home hero heading |
| `components/__tests__/Button.test.jsx` | 5 | Render, onClick, disabled+spinner loading state, disabled prop, no-call-when-disabled |
| `components/__tests__/Modal.test.jsx` | 4 | Closed = renders nothing, open renders content, close via × button, close via backdrop click |
| `components/__tests__/StarRating.test.jsx` | 6 | Default 5 stars, filled/empty count, 0-value, non-interactive has no button role, interactive has button role, onChange fires with correct value |
| `components/__tests__/ProtectedRoute.test.jsx` | 2 | Redirect to `/login` unauthenticated, renders children when authenticated |
| `components/__tests__/Badge.test.jsx` | 2 | Renders label text, falls back to gray for unknown labels |
| `components/__tests__/ListingCard.test.jsx` | 7 | Title, price in KSh format, seller name, correct detail link, category placeholder when no image, `<img>` when image present, description text |
| `pages/__tests__/MarketplacePage.test.jsx` | 5 | Hero heading, 7 category buttons, empty state, listings rendered from API, search form calls API with param |
| `pages/__tests__/LoginPage.test.jsx` | 4 | Brand heading, "Continue with Google" link, link points to correct auth endpoint, university-email disclaimer shown |
| `context/__tests__/AuthContext.test.jsx` | 5 | Starts unauthenticated, restores session from localStorage, login persists user+token, logout clears state, updateUser patches partial fields |

No `TODO`/`FIXME`/`XXX` markers found anywhere in the repo (checked `.js`, `.jsx`, `.md`, `.sql`).

---

## 9. CI/CD Pipeline

### `.github/workflows/ci.yml` — triggers on every `push` and `pull_request` (all branches, no branch filter in the YAML itself, despite the README describing it as "main/develop" — see §12)

Three jobs:
1. **`lint-and-test-server`** — `ubuntu-latest`, working dir `server`. Spins up a `postgres:15-alpine` **service container** (`test`/`test`/`skillswap_test`, health-checked). Steps: checkout → `setup-node@v4` (Node 20, npm cache) → `npm ci` → `npm run lint` → `npm test`, with env vars `DATABASE_URL`, `JWT_SECRET=ci-test-secret`, `JWT_REFRESH_SECRET=ci-test-refresh-secret`, `CLIENT_URL=http://localhost:3000`, `SESSION_SECRET=ci-session-secret`, `NODE_ENV=test`.
2. **`lint-and-test-client`** — `ubuntu-latest`, working dir `client`. checkout → `setup-node@v4` (Node 20) → `npm ci` → `npm run lint` → `npm test`.
3. **`docker-build`** — depends on (`needs:`) both jobs above. Builds the server image (`context: ./server`) and client image (`context: ./client`) via `docker/build-push-action@v5` with `push: false` (build-check only, no registry push).

### `.github/workflows/cd.yml` — triggers via `workflow_run` on the `CI` workflow completing on branch `main`, gated `if: github.event.workflow_run.conclusion == 'success'`

One job, `deploy`: two `curl -f -X POST` calls hitting `${{ secrets.RENDER_DEPLOY_HOOK_SERVER }}` and `${{ secrets.RENDER_DEPLOY_HOOK_CLIENT }}` — triggers Render's deploy hooks directly rather than using a Render GitHub Action.

### `docker-compose.yml` services
- **`db`**: `postgres:15-alpine`, configurable user/pass/db via env (defaults `skillswap`/`skillswap`/`skillswap_dev`), persisted volume `postgres_data`, exposed on host port `${DB_HOST_PORT:-5432}`, healthchecked with `pg_isready`.
- **`server`**: builds `./server` targeting the Dockerfile's `development` stage, env-file `.env` plus computed `DATABASE_URL` pointing at the `db` service, live-mounts `./server:/app` (with an anonymous volume over `node_modules` to avoid host/container conflicts), port `${SERVER_HOST_PORT:-5000}`, waits on `db`'s healthcheck.
- **`client`**: builds `./client` targeting `development`, sets `VITE_API_URL` to the host-mapped server port, live-mounts source, port `${CLIENT_HOST_PORT:-3000}`, depends on `server` (not health-gated, just start-order).

### Dockerfiles (see §2 for stage details) — both are multi-stage with a `development` target used by compose and a `production` target used for the actual deploy image (server: plain Node process; client: static build served by nginx with SPA fallback + `/api` reverse-proxy to the `server` container, per `nginx.conf`).

---

## 10. Local Development Setup

### `.env.example` (root — this is the one referenced by the README/docker-compose flow)

| Variable | Inline comment / section | Purpose |
|---|---|---|
| `NODE_ENV` | Server | `development` |
| `PORT` | Server | `5000` |
| `DATABASE_URL` | Database | full Postgres connection string |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database | compose-container Postgres credentials |
| `JWT_SECRET` | Auth | "replace_with_a_long_random_string" |
| `JWT_REFRESH_SECRET` | Auth | "replace_with_a_different_long_random_string" |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 | OAuth app credentials |
| `GOOGLE_CALLBACK_URL` | Google OAuth 2.0 | `http://localhost:5000/api/v1/auth/google/callback` |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Cloudinary | image upload credentials |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_USER` / `EMAIL_PASS` | Nodemailer | SMTP config (comment: "your_gmail_app_password") |
| `VITE_API_URL` | Client | comment: "prefix all Vite env vars exposed to the browser with VITE_"; `http://localhost:5000/api` |

### `server/.env.example` (a second, **stale/inconsistent** file — see §12)
```
PORT=5000
NODE_ENV=development
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/skillswap
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
# Session / JWT
SESSION_SECRET=change_me
JWT_SECRET=your_jwt_secret
```
Missing `JWT_REFRESH_SECRET`, Cloudinary vars, and email vars — all of which the live code requires. `SESSION_SECRET` appears here and in CI's env block but is not read anywhere in `server/src` (grep found no usage) — dead/legacy var.

### `package.json` scripts (exact commands)

**Server** (`server/package.json`):
```bash
npm install          # install deps
npm run migrate       # node src/db/migrate.js — apply pending SQL migrations
npm run seed           # node src/db/seed.js — wipe + reseed 10 users / 30 listings / 15 inquiries / accepted-only reviews
npm run dev             # nodemon src/index.js
npm start                # node src/index.js
npm run lint              # eslint src
npm test                   # jest --forceExit --runInBand
```

**Client** (`client/package.json`):
```bash
npm install    # install deps
npm start       # vite (dev server)
npm run build    # vite build
npm run lint      # eslint src
npm test           # vitest run
```

**Full local stack** (per README): `cp .env.example .env` then `docker compose up --build` → client on `:3000`, server on `:5000`, Postgres on `:5432`.

---

## 11. Future Enhancements

No `TODO`/`FIXME` comments found anywhere in the codebase. No roadmap/"future plans" section exists in `README.md`. **Not found in repo.**

---

## 12. Anything Else Worth Noting

### README content not already covered
- README's tech-stack table lists **Bcrypt** under Auth, but no bcrypt/bcryptjs dependency or usage exists anywhere — auth is Google OAuth + JWT only, no local password storage. Likely a stale/aspirational line.
- README documents CI as running "on every push and pull request to `main`/`develop`" — the actual `ci.yml` has no branch filter at all (`on: push / pull_request` with no `branches:` key), so it runs on pushes/PRs to **any** branch, not just those two.
- README's CD description is accurate and matches `cd.yml` (workflow_run gated on CI success, main only).
- README documents the full Render Blueprint first-time setup steps, required GitHub secrets (`RENDER_DEPLOY_HOOK_SERVER`, `RENDER_DEPLOY_HOOK_CLIENT`), and explains why `autoDeployTrigger: off` is set in `render.yaml` (so only a green CI run can trigger a prod deploy).

### Inconsistencies between code and docs / dead code found

1. **Two parallel, incompatible migration systems.** `server/migrations/*.js` (root of `server/`) is a `node-pg-migrate`-style set of files defining a **different schema** than what's live: UUID primary keys (vs the live `SERIAL` ints), `listings.status`/`skills_offered`/`skills_wanted` (vs live `category`/`price`), `inquiries.sender_id`/`receiver_id` (vs live `buyer_id`, seller derived via join), `reviews.reviewee_id` + `UNIQUE(reviewer_id, reviewee_id, listing_id)` (vs live `seller_id` + `UNIQUE(inquiry_id)`). There is no `node-pg-migrate` dependency in `package.json`, and `npm run migrate` points at `server/src/db/migrate.js`, which only reads `server/src/db/migrations/*.sql`. **This entire `server/migrations/` directory is orphaned/unreachable — likely leftover from an earlier design (possibly Robert-M's or an early scaffold) and should probably be deleted or explicitly called out as legacy.**
2. **`server/src/middleware/userValidators.js` is unused.** Defines `updateMeRules`/`getUserRules` against UUID ids and a `photo_url` (snake_case) body field, but `grep -rn "userValidators"` finds zero imports anywhere in `server/src`. The live `users.js` route uses its own inline `express-validator` chains with integer ids and camelCase `photoUrl`. Dead file, and its assumptions (UUID ids) don't even match the live integer-PK schema.
3. **`SESSION_SECRET`** is referenced in the root `.env.example`, `server/.env.example`, and CI's test env — but no code in `server/src` reads `process.env.SESSION_SECRET`. Vestigial from an earlier session-based auth design, superseded by JWT.
4. **Two divergent `.env.example` files** (`/.env.example` vs `/server/.env.example`) — the server-local one is missing `JWT_REFRESH_SECRET`, all three Cloudinary vars, and all four email vars, all of which the running server requires at import time (`passport.js`, `uploads.js`, `email.js` all read `process.env.*` unconditionally). Following `server/.env.example` alone would produce a broken local server.
5. **Team-branch code not present in the shipped branch.** Robert-M's branch commit "Add cleanup for expired refresh tokens in authentication flow" describes a maintenance job that is **not present** in the current `michael` branch's `auth.js`/`jwt.js` — no cron/interval cleanup of expired `auth_tokens` rows exists in the live code (only the `pendingAuth` in-memory Map has a `setInterval` sweep, for OAuth exchange codes, not refresh tokens).
6. **Endpoint documented in code but easy to miss**: `GET /api/health` (note: **not** under `/api/v1`) — a bare health-check endpoint used by Docker/Render healthchecks, separate from the versioned API surface.
7. **No `models/` or `controllers/` layer** despite folders existing (both contain only `.gitkeep`) — all query logic lives directly in route handler files. Worth noting in an architecture doc as "route-handler pattern, no MVC layering," not an oversight to "fix."
8. **LICENSE** is MIT, copyright "Michael Muraya" (2026) — i.e., attributed to the SolveMMG/repo-owner identity, not the whole team.
9. **`/tmp` note**: a stray `.c/` directory (containing `settings.local.json`) exists at the repo root alongside a deleted `.claude/settings.local.json` per git status — unrelated to the app, looks like local tooling config, not part of the product; not documented further here since it's outside the app's scope.

### Genuinely not found in repo
- Team members' full names / student IDs / assigned formal roles beyond what git authorship implies.
- Any written roadmap, future-feature list, or product backlog.
- Contents of `server/tests/globalSetup.js` / `globalTeardown.js` were not deep-dived (only counted, not read line-by-line) — pull these in if the docs need exact DB-provisioning-for-tests detail.
- Any design docs, wireframes, or non-code planning artifacts (none exist in the repo).

---

## Summary of what's covered vs. what needs manual input

**Fully sourced from repo:** stack + versions, architecture, DB schema (all 7 migrations), all 6 route files' endpoints/business rules, error shape, full auth flow trace, all 17 test files' structure (88 tests total), CI/CD pipeline and Docker setup, env vars, npm scripts, and a full contributor/role table inferred from commit history across all branches.

**Needs your input before finalizing:**
- Real names/roles for teammates (git only gives handles/emails).
- How to frame the fact that the `michael` branch (this doc's basis) rebuilt/diverged from the team's merged `main` work — do you want the docs to credit original authors for design intent even though the shipped code differs, or document only what's literally in `michael`?
- Whether to delete or explicitly flag as legacy: `server/migrations/*.js`, `userValidators.js`, `SESSION_SECRET` references, and the stale `server/.env.example`.
- Any roadmap/future-work section — nothing exists in-repo to source it from.
