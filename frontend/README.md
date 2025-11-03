# Lister Frontend Application

This document describes how to work with the Vite React frontend application in the Lister project.

## Development Environment

The frontend is configured to run in Docker as part of the development stack. It's built with:

- **Vite** - Fast build tool and dev server
- **React 19** - Latest React with modern features
- **Chakra UI** - Modern component library
- **Hot Module Replacement** - Instant updates during development

## Running the Application

### Using Docker Compose (Recommended)

```bash
cd infra/local
docker compose up --build
```

This will start all services including:
- Frontend (Vite dev server) on http://localhost:5173
- Backend API on http://localhost:3000
- Nginx proxy on http://localhost:80
- PostgreSQL on http://localhost:5432
- pgAdmin on http://localhost:8080

### Accessing the Frontend

The nginx proxy configuration serves the frontend at the `/app` path, making it available at `http://localhost/app/`.

## Development Workflow

1. **Start Services**: Run `docker compose up --build` from `infra/local/`
2. **Edit Code**: Make changes to files in the `frontend/` directory
3. **Hot Reload**: Changes are automatically reflected in the browser
4. **Volume Mounting**: The frontend source code is mounted as a volume for live updates

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Entry point
│   └── assets/          # Static assets
├── public/              # Public static files
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration (includes /app base path)
└── Dockerfile           # Development Docker configuration
```

## Configuration

### Vite Configuration

The frontend is configured with:
- Base path: `/app/` (for nginx proxy)
- Host: `0.0.0.0` (for Docker networking)
- Port: `5173` (Vite default)

### Docker Configuration

- **Image**: Node.js current alpine
- **Port**: 5173 (mapped to host)
- **Volumes**: Source code mounted for development
- **Command**: `npm run dev --host`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Environment Variables

The frontend runs with:
- `NODE_ENV=development`

## Nginx Proxy Configuration

The nginx proxy is configured to:
- Route `/app/` requests to the frontend service
- Handle SPA routing for React Router
- Add security headers
- Proxy API requests to `/api/` to the backend

## Troubleshooting

1. **Services not starting**: Check `docker compose logs` for errors
2. **Frontend not accessible**: Ensure nginx is running and properly configured
3. **Hot reload not working**: Verify volume mounts in docker-compose.yml
4. **Build errors**: Check frontend logs with `docker compose logs frontend`

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
