# Project Management Tool

A fullstack multi-tenant project management application with role-based access control, caching, and event-driven architecture.

## Features

- **Backend**: Node.js + Express REST API with TypeScript
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
- Tailwind CSS
- Radix UI Components
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

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd ../ui
npm install
```

3. Start PostgreSQL, Redis, and Kafka (using Docker Compose):
```bash
cd ../backend
docker-compose up -d
```

4. Run database migrations:
```bash
npm run db:migrate
```

5. Start the backend server:
```bash
npm run dev
```

6. Start the frontend development server (in a new terminal):
```bash
cd ../ui
install dependencies
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user
- `POST /api/auth/signin` - Sign in user
- `POST /api/auth/create-admin` - Create admin user (requires authentication)

### User Routes (Full CRUD access to own data)
- `GET /api/user/projects` - Get user's projects (cached for 1 minute)
- `GET /api/user/projects/:id` - Get specific project
- `POST /api/user/projects` - Create new project
- `PUT /api/user/projects/:id` - Update project
- `DELETE /api/user/projects/:id` - Delete project
- `GET /api/user/projects/:projectId/tasks` - Get project tasks
- `GET /api/user/projects/:projectId/tasks/:taskId` - Get specific task
- `POST /api/user/projects/:projectId/tasks` - Create new task
- `PUT /api/user/projects/:projectId/tasks/:taskId` - Update task
- `DELETE /api/user/projects/:projectId/tasks/:taskId` - Delete task

### Admin Routes (Read access to all data)
- `GET /api/admin/projects` - Get all projects
- `GET /api/admin/projects/:id` - Get specific project
- `GET /api/admin/:userId/projects` - Get user's projects
- `GET /api/admin/:userId/projects/:projectId` - Get user's project with tasks

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **USER**: Can perform CRUD operations on their own projects and tasks
- **ADMIN**: Can perform read operations on all projects and tasks across all users

## Caching

- GET `/api/user/projects` is cached in Redis for 1 minute
- Cache is automatically invalidated when projects are created, updated, or deleted
- Cache keys are user-specific to ensure data isolation
- Admin routes also use caching for improved performance



## Development




## Environment Variables

### Backend Environment Variables

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

