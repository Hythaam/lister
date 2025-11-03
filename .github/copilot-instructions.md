# Lister Codebase Guide

Lister is a collaborative gift list management application with a React frontend, Fastify backend, and PostgreSQL database.

## Architecture Overview

### Stack
- **Frontend**: React 19 + Vite 7 (ES modules, no TypeScript)
- **Backend**: Fastify 5 + TypeORM (ES modules, PostgreSQL)
- **Database**: PostgreSQL with TypeORM EntitySchema pattern
- **Auth**: Basic HTTP authentication with bcrypt
- **Dev Environment**: Docker Compose with nginx proxy

### Key Design Patterns

**Entity Schema Pattern**: Backend uses TypeORM's EntitySchema instead of decorators
```javascript
// See backend/entities/user.js for pattern
export class User { constructor() { this.id = undefined; } }
export const UserSchema = new EntitySchema({ name: 'User', target: User, ... });
```

**Plugin Architecture**: Fastify plugins in `backend/plugins/` for cross-cutting concerns
- `db.js`: TypeORM DataSource with auto-sync enabled
- `auth.js`: Basic auth with user context injection via `@fastify/request-context`
- `swagger.js`: API documentation generation

**Route Structure**: RESTful routes in `backend/routes/` with comprehensive JSON schemas
- All endpoints require basic auth except registration
- Schemas define request/response validation and OpenAPI docs
- User context available via `req.requestContext.get('user')`

## Critical Development Workflows

### Local Development Setup
```bash
# Start full stack with Docker
cd infra/local && docker-compose up -d
# Frontend dev server
cd frontend && npm run dev
# Backend dev server with hot reload
cd backend && npm run dev
```

### Database Schema Management
- TypeORM `synchronize: true` in development (auto-migrates schema)
- Entities define relationships using TypeORM EntitySchema syntax
- Database URL: `postgres://lister_user:lister_password@localhost:5432/lister_db`

### API Development
- Generate OpenAPI docs: Backend swagger UI at `/documentation`
- All routes require schema definitions for request/response validation
- User authentication stores user object in request context for authorization

## Project-Specific Conventions

### Backend Patterns
- **ES Modules**: All files use `import/export`, `"type": "module"` in package.json
- **Fastify Plugins**: Use `fastify-plugin` wrapper for reusable functionality
- **Entity Relations**: Foreign keys manually defined (e.g., `user_id` column, `user` relation)
- **Password Security**: Always hash with `fastify.bcrypt.hash()` before storing

### Frontend Structure (Planned)
- Component-based architecture in `src/components/`
- Custom hooks in `src/hooks/` for API and state management
- Service layer in `src/services/` for API communication
- Mobile-first responsive design approach

### Authentication Flow
- Basic Auth header: `Authorization: Basic base64(email:password)`
- User context injection: `req.requestContext.set('user', userObj)`
- Role-based access: Users have `roles` array (admin/user)

## Integration Points

### API Endpoints
- `/api/users` - User management and registration
- `/api/lists` - List CRUD operations
- `/api/items` - List item management
- `/api/comments` - Item commenting system
- `/api/groups` - User group management

### Database Relationships
- Users → Lists (one-to-many)
- Lists → Items (one-to-many)
- Items → Comments (one-to-many)
- Lists ↔ Groups (many-to-many sharing)

### Core Business Logic
- **Privacy Rule**: List owners cannot see comments on their own items
- **Sharing**: Lists shared with groups, not individual users
- **Authentication**: All API access requires valid user credentials

## Development Environment

### Required Services
- PostgreSQL (Docker: `lister_postgres`)
- pgAdmin (Docker: `lister_pgadmin`, admin@lister.com/admin123)
- Nginx proxy (Docker: routes frontend/backend)

### Key Configuration Files
- `infra/local/docker-compose.yml` - Complete local environment
- `backend/plugins/db.js` - Database connection configuration
- `frontend/vite.config.js` - Build and dev server configuration