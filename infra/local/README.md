# Lister Local Development Environment

This docker-compose setup provides a complete local development environment for the Lister application with:

- **Backend API** (Fastify/Node.js)
- **PostgreSQL Database**
- **Nginx Reverse Proxy**

## Quick Start

1. **Start all services:**
   ```bash
   cd infra/local
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f backend
   docker-compose logs -f nginx
   docker-compose logs -f postgres
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

4. **Stop and remove volumes (clean slate):**
   ```bash
   docker-compose down -v
   ```

## Service Details

### 🌐 Nginx Reverse Proxy
- **Port:** 80 (HTTP)
- **URL:** http://localhost
- **Features:**
  - Rate limiting
  - CORS handling
  - Security headers
  - Health checks
  - API proxying to backend

### 🚀 Backend API
- **Port:** 3000 (direct access)
- **URL:** http://localhost:3000 (direct) or http://localhost/api (via nginx)
- **Health Check:** http://localhost/backend-health
- **Features:**
  - Fastify framework
  - PostgreSQL integration
  - Auto-reload on code changes

### 🗄️ PostgreSQL Database
- **Port:** 5432
- **Database:** lister_db
- **Username:** lister_user
- **Password:** lister_password
- **Connection String:** `postgres://lister_user:lister_password@localhost:5432/lister_db`

## Available Endpoints

| Endpoint | Description | Example |
|----------|-------------|---------|
| `/` | Landing page | http://localhost |
| `/health` | Nginx health check | http://localhost/health |
| `/backend-health` | Backend health check | http://localhost/backend-health |
| `/api/users` | Users API | http://localhost/api/users |
| `/nginx-status` | Nginx stats (internal) | - |

## Development Workflow

### Making Backend Changes
1. Edit files in `../../backend/`
2. Changes are automatically reflected (volume mount + nodemon)
3. Check logs: `docker-compose logs -f backend`

### Database Access
```bash
# Connect to database
docker-compose exec postgres psql -U lister_user -d lister_db

# Or from host (if psql installed)
psql postgres://lister_user:lister_password@localhost:5432/lister_db
```

### Rebuilding Services
```bash
# Rebuild backend after dependency changes
docker-compose build backend
docker-compose up -d backend

# Rebuild and restart all
docker-compose up -d --build
```

## Configuration Files

- `docker-compose.yml` - Service definitions
- `nginx.conf` - Nginx configuration
- `index.html` - Landing page

## Environment Variables

The backend service uses these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NODE_ENV` | development | Environment mode |
| `PORT` | 3000 | Backend server port |
| `DATABASE_URL` | postgres://... | Database connection |

## Troubleshooting

### Services Won't Start
```bash
# Check status
docker-compose ps

# View detailed logs
docker-compose logs

# Restart specific service
docker-compose restart backend
```

### Database Connection Issues
```bash
# Check postgres logs
docker-compose logs postgres

# Verify database is healthy
docker-compose exec postgres pg_isready -U lister_user
```

### Nginx Issues
```bash
# Test nginx configuration
docker-compose exec nginx nginx -t

# Reload nginx config
docker-compose exec nginx nginx -s reload
```

### Port Conflicts
If ports 80, 3000, or 5432 are already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

## Production Notes

This setup is for **development only**. For production:

1. Use environment-specific configs
2. Enable HTTPS with proper SSL certificates
3. Use secrets management
4. Configure proper logging
5. Set up monitoring and alerting
6. Use production-grade database settings

## SSL/HTTPS Setup

To enable HTTPS:

1. Create SSL certificates in `./ssl/` directory
2. Uncomment HTTPS server block in `nginx.conf`
3. Update the nginx service to expose port 443

```bash
# Self-signed certificates for development
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem
```