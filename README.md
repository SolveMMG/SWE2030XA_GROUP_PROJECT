# SkillSwap

A micro-freelance skill exchange marketplace for university students. Students list services they offer (tutoring, design, tech support, proofreading) and hire other students for tasks — all verified through university Google accounts.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, HTML5, CSS3 |
| Backend | Node.js, Express.js, REST API |
| Database | PostgreSQL |
| Auth | Google OAuth 2.0, JWT, Bcrypt |
| Media | Cloudinary |
| Email | Nodemailer |
| DevOps | GitHub Actions, Docker, Render |

## Project Structure

```
SkillSwap/
├── .github/
│   └── workflows/
│       ├── ci.yml          # Lint, test, Docker build check (all branches)
│       └── cd.yml          # Deploy to Render (main only)
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── services/
│   ├── Dockerfile
│   └── nginx.conf
├── server/                 # Node.js / Express API
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       └── utils/
│   └── Dockerfile
├── docker-compose.yml      # Local dev (client + server + postgres)
├── .env.example
└── .gitignore
```

## Getting Started (local dev)

1. Copy the environment file and fill in your values:
   ```bash
   cp .env.example .env
   ```

2. Start all services with Docker:
   ```bash
   docker compose up --build
   ```

   | Service | URL |
   |---|---|
   | Client | http://localhost:3000 |
   | Server | http://localhost:5000 |
   | Postgres | localhost:5432 |

## CI/CD

**CI** runs on every push and pull request to `main`/`develop`:
- Lint and test the server (with a live Postgres service container)
- Lint and test the client
- Verify both Docker images build cleanly

**CD** runs on push to `main` after CI passes:
- Triggers Render deploy hooks for the server and client services

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `RENDER_DEPLOY_HOOK_SERVER` | Render deploy hook URL for the backend service |
| `RENDER_DEPLOY_HOOK_CLIENT` | Render deploy hook URL for the frontend service |

Add these under **Settings → Secrets and variables → Actions** in the GitHub repo.
