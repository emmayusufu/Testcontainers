# Node.js Integration Testing with Testcontainers

This project demonstrates how to implement automated integration testing in Node.js using Testcontainers, Express, PostgreSQL, and Redis. It provides a robust example of building a RESTful API with proper testing practices and containerized dependencies.

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

**Without Docker (Development):**

```bash
npm run dev
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
