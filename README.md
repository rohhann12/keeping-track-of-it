# Project Management Tool

A fullstack multi-tenant project management application with role-based access control, caching, and event-driven architecture.

## Features

- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with role-based access control
- **Caching**: Redis for improved performance
- **Event Streaming**: Kafka for event-driven architecture
- **Frontend**: React dashboard (coming soon)

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- Redis
- Kafka
- JWT Authentication
- Docker

### Frontend (Coming Soon)
- React
- TypeScript
- Role-based routing

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Using Docker Compose (Recommended)

1. Clone the repository
2. Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/project_management?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"
REDIS_URL="redis://localhost:6379"
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="project-management-api"
PORT=3001
NODE_ENV="development"
```

3. Start all services:
```bash
docker-compose up -d
```

4. Run database migrations:
```bash
docker-compose exec backend npx prisma migrate dev
```

5. The API will be available at `http://localhost:3001`

### Local Development

1. Install dependencies:
```bash
cd backend
npm install
```

2. Start PostgreSQL, Redis, and Kafka (using Docker Compose):
```bash
docker-compose up -d
```

3. Run database migrations:
```bash
npm run db:migrate
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/signin` - Sign in user
- `GET /api/auth/me` - Get current user info

### user Routes (Read-only access)
- `GET /api/user/projects` - Get user's projects (cached for 1 minute)
- `GET /api/user/projects/:id` - Get specific project
- `GET /api/user/projects/:projectId/tasks` - Get project tasks
- `GET /api/user/projects/:projectId/tasks/:taskId` - Get specific task

### admin Routes (Full Read access)
- `GET /api/admin/projects` - Get all projects
- `GET /api/admin/projects/:projectId/tasks` - Get project tasks

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### user Roles
- **user**: Can only view their own projects and tasks
- **admin**: Can perform CRUD operations on all projects and tasks

## Caching

- GET `/api/user/projects` is cached in Redis for 1 minute
- Cache is automatically invalidated when projects are created, updated, or deleted
- Cache keys are user-specific to ensure data isolation



## Development

### Available Scripts
-`cd into backend`
- Build the backed folder and then run the backend
- Run `node dist/index.js` - Start development server
- `cd to ui`
- Install dependencies
- Run `npm run dev` to start the frontend locally


## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/project_management?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Redis
REDIS_URL="redis://localhost:6379"

# Kafka
KAFKA_BROKERS="localhost:9092"
KAFKA_CLIENT_ID="project-management-api"

# Server
PORT=3001
NODE_ENV="development"
```

## Docker Services

- **postgres**: PostgreSQL database
- **redis**: Redis cache
- **kafka**: Kafka message broker
- **zookeeper**: Kafka dependency
- **backend**: Node.js API server

## Health Check

Check if the API is running:
```bash
curl http://localhost:3001/health
```

## Next Steps

1. Frontend React application
2. API documentation
3. Production deployment configuration
