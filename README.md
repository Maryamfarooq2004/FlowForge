# FlowForge Monorepo

FlowForge is an AI-powered platform that converts clinic and school workflows into full-stack applications using forms, chat, and file uploads. It generates WorkflowSpecs, React frontends, Node.js backends, PostgreSQL databases, RBAC, notifications, and customizable UI templates.

Welcome to the FlowForge project. This is a monorepo containing the frontend, backend, and OCR microservice.

## Structure

- `client/`: React frontend (Vite)
- `server/`: Node.js/TypeScript backend (Steps 2–7)
- `python-service/`: OCR microservice (Step 6)
- `.github/workflows/`: CI/CD pipelines

## Getting Started

### Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Maryamfarooq2004/FlowForge.git
    cd FlowForge
    ```

2.  **Environment Variables**:
    - Copy `client/.env.example` to `client/.env` and update values.
    - (Upcoming) Copy `server/.env.example` to `server/.env`.

3.  **Run with Docker**:
    ```bash
    docker-compose up
    ```

### Deployment

The frontend is configured to deploy to Vercel via GitHub Actions.
Required GitHub Secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_BASE_URL`

## Security

- Secrets are NEVER committed to the repository.
- `.gitignore` is configured to catch all `.env` files.
- Frontend authentication uses `httpOnly` cookies managed by the backend.
