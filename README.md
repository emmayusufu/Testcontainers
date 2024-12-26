# Node.js Integration Testing with Testcontainers

his repository demonstrates how to **automate integration testing** in **Node.js** using **Testcontainers** and the ** Node Test Runner**.

## Features

- **Express.js REST API**: Complete CRUD operations for user management
- **PostgreSQL Integration**: Persistent data storage with proper connection management
- **Redis Caching**: Implemented caching layer for improved performance
- **Docker Integration**: Containerized application and dependencies
- **Automated Testing**: Integration tests using Testcontainers
- **TypeScript**: Full TypeScript implementation for better type safety

## Prerequisites

- Node.js (v20 or later)
- Docker and Docker Compose
- npm or yarn package manager

## Getting Started

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:

```env
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
POSTGRES_PORT
```

3. Install dependencies:

```bash
npm install
```

4. Start the application:

**With Docker Compose:**

```bash
# Build and start containers
npm run up:build

# Start existing containers
npm run up

# Stop containers and remove volumes
npm run down
```

## API Endpoints

### Users API

- **GET /users**

  - Retrieve all users
  - Response: Array of user objects

- **GET /users/:id**

  - Retrieve a specific user
  - Response: Single user object
  - Features Redis caching

- **POST /users**

  - Create a new user
  - Request body: `{ "name": "string", "email": "string" }`
  - Response: Created user object

- **PUT /users/:id**

  - Update an existing user
  - Request body: `{ "name?: "string", "email?: "string" }`
  - Response: Updated user object

- **DELETE /users/:id**
  - Delete a user
  - Response: 204 No Content

## Testing

The project uses Node's built-in test runner with Testcontainers for integration testing. Testcontainers automatically manages PostgreSQL and Redis instances for testing.

Run tests:

```bash
npm test
```

Test features include:

- Automated container lifecycle management
- Database cleanup between tests
- Redis cache verification
- Complete API endpoint testing

## Project Structure

```
├── src/
│   ├── app.ts           # Express application setup
│   ├── app.test.ts      # Integration tests
│   ├── managers/        # Database and Redis managers
│   └── server.ts        # Application entry point
├── docker-compose.yaml  # Container orchestration
├── Dockerfile          # Application container definition
├── package.json        # Project dependencies
└── README.md          # This file
```

## Technical Details

### Database Manager

- Singleton pattern implementation
- Supports both production and test environments
- Automatic table creation
- Connection pooling

### Redis Manager

- Singleton pattern implementation
- Configurable for both production and test environments
- Automatic connection management

### Testing Configuration

- Isolated test containers for each test run
- Automatic cleanup between tests
- Comprehensive API testing coverage
