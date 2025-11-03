# Swagger API Documentation

The Lister backend now includes comprehensive API documentation using Swagger (OpenAPI 3.0).

## Accessing the Documentation

Once the server is running, you can access the interactive API documentation at:

```
http://localhost:3000/docs
```

Or if running on a different port:
```
http://localhost:{PORT}/docs
```

## Features

- **Interactive API Explorer**: Test endpoints directly from the browser
- **Schema Validation**: Request/response schemas are automatically validated
- **Authentication Support**: Basic authentication is documented and supported
- **Comprehensive Documentation**: All endpoints include descriptions, parameters, and response examples

## Available Endpoints

### Health Check
- `GET /health` - Server health status

### User Management
- `GET /api/users` - Get all users (requires admin role)
- `GET /api/users/{id}` - Get user by ID (requires authentication)
- `POST /api/users` - Create new user (public registration)
- `PUT /api/users/{id}` - Update user (users can only update themselves)
- `DELETE /api/users/{id}` - Delete user (requires admin role)

## Schema Definitions

The API includes comprehensive schema definitions for:

- **User**: Contains id (UUID), email, and roles
- **UserCreate**: For user registration (email, password)
- **UserUpdate**: For user updates (optional email, password, roles)
- **Error**: Standard error response format

## Security

All authenticated endpoints use HTTP Basic Authentication. The Swagger UI includes an "Authorize" button to set up authentication credentials for testing.

## Technical Implementation

The Swagger integration uses:
- `@fastify/swagger` - Core Swagger plugin for Fastify
- `@fastify/swagger-ui` - Interactive UI for API documentation
- Custom plugin module (`plugins/swagger.js`) - Encapsulates Swagger configuration
- JSON Schema validation for all request/response bodies
- Automatic API specification generation from route schemas

## Plugin Architecture

The Swagger functionality is organized into a dedicated plugin module for better maintainability:

### `/plugins/swagger.js`
Contains all Swagger and Swagger UI configuration:
- API metadata (title, description, version)
- Security definitions (Basic Auth)
- UI customization settings
- Environment-aware host configuration

This modular approach allows for:
- **Better separation of concerns**: Swagger config is isolated from main server logic
- **Easier maintenance**: All Swagger settings in one place
- **Reusability**: Plugin can be easily reused across different projects
- **Testability**: Plugin can be tested independently

## Development

When adding new endpoints, make sure to include proper schema definitions in the route configuration:

```javascript
fastify.get('/endpoint', {
  schema: {
    description: 'Endpoint description',
    tags: ['tag'],
    response: {
      200: { /* response schema */ }
    }
  }
}, handlerFunction);
```

This ensures that the endpoint is properly documented in Swagger.