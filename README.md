# Node.js Integration Testing with Testcontainers

This repository demonstrates how to **automate integration testing** in **Node.js** using **Testcontainers**. By leveraging **Dockerized services** (such as PostgreSQL in this case), you can spin up isolated environments for your tests, ensuring that your tests are **clean**, **repeatable**, and **reliable**. Testcontainers takes care of setting up and tearing down external dependencies like databases, so you can focus on writing tests without worrying about environment management.

## Features

- **Automated database testing** with Testcontainers and Docker.
- **Spin up PostgreSQL** containers for each test.
- **Clean, isolated environments** for each test run, ensuring no shared state.
- Easy integration with **Jest** for test automation.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Project Structure](#project-structure)
5. [Example Tests](#example-tests)
6. [How It Works](#how-it-works)
7. [Running the Tests](#running-the-tests)
8. [CI/CD Integration](#cicd-integration)
9. [License](#license)

---

## Prerequisites

Before you can run the project, make sure you have the following installed:

1. **Node.js** (v14 or higher) - [Install Node.js](https://nodejs.org/)
2. **Docker** - [Install Docker](https://www.docker.com/products/docker-desktop)
3. **PostgreSQL** Docker image (automatically pulled by Testcontainers)

If you're new to Docker or Testcontainers, don't worry! This example provides everything you need to get started with minimal setup.

---

## Installation

### 1. Clone the repository:

```bash
git clone https://github.com/your-username/nodejs-testcontainers-example.git
cd nodejs-testcontainers-example
```

### 2. Install project dependencies:

```bash
npm install
```

This will install:

- `pg` – PostgreSQL client for Node.js.
- `testcontainers` – Testcontainers library for managing Docker containers.
- `jest` – Testing framework for Node.js.

---

## Usage

### 1. Create your test environment:

The project is already set up to use **PostgreSQL** via **Testcontainers** for integration testing. The example demonstrates how to write tests that interact with a PostgreSQL container.

### 2. Write your tests:

You can write tests in the `db.test.js` file, which connects to a PostgreSQL database container. The tests will automatically run against a fresh database spun up by Testcontainers for each test.

### 3. Run the tests:

```bash
npx jest
```

Testcontainers will:

- Start a Docker container running PostgreSQL.
- Set the necessary environment variables (like the connection string).
- Run the tests and ensure that the PostgreSQL database is available.
- Stop the container after the tests complete.

---

## Project Structure

Here's the structure of the project:

```
nodejs-testcontainers-example/
│
├── db.js                # Application code for interacting with PostgreSQL.
├── db.test.js           # Jest tests for integration with PostgreSQL.
├── package.json         # Project configuration and dependencies.
├── package-lock.json    # Locked versions of dependencies.
└── README.md            # This file.
```

- `db.js`: Contains functions that interact with the PostgreSQL database (e.g., create tables, add users).
- `db.test.js`: Contains Jest tests for interacting with the PostgreSQL database. Testcontainers is used here to spin up the PostgreSQL container.

---

## Example Tests

Here's an example of an integration test using **Testcontainers** to spin up a **PostgreSQL** container and test database interactions:

### db.test.js

```js
const { PostgreSqlContainer } = require("testcontainers");
const { createTable, addUser, getUsers } = require("./db");
let postgresContainer;

beforeAll(async () => {
  // Start PostgreSQL container
  postgresContainer = await new PostgreSqlContainer().start();

  const connectionString = postgresContainer.getConnectionString();
  process.env.DATABASE_URL = connectionString; // Set connection string for db.js to use

  // Create table in the database
  await createTable();
});

afterAll(async () => {
  await postgresContainer.stop(); // Stop container after tests
});

test("should add a user and retrieve it from the database", async () => {
  const userId = await addUser("John Doe");
  const users = await getUsers();
  expect(users).toHaveLength(1);
  expect(users[0].id).toBe(userId);
  expect(users[0].name).toBe("John Doe");
});
```

This test:

1. Starts a PostgreSQL container using Testcontainers.
2. Sets up the connection string to the container.
3. Tests that adding and retrieving a user from the database works as expected.

---

## How It Works

Testcontainers automates the process of managing Docker containers during tests:

1. **Container Lifecycle**: The PostgreSQL container is automatically created, started, and stopped around each test suite.
2. **Environment Variables**: The `DATABASE_URL` environment variable is set dynamically to the connection string provided by Testcontainers.
3. **Isolation**: Every test gets a fresh, isolated PostgreSQL instance. Once the tests complete, the container is stopped and removed automatically.

This ensures that every test run is clean and free from interference from previous tests, improving reliability and repeatability.

---

## Running the Tests

To run the tests, simply execute the following command:

```bash
npx jest
```

Jest will run the tests and output the results in the terminal. You should see logs about the PostgreSQL container being started and stopped, as well as the test results.

---

## CI/CD Integration

Testcontainers works well in **CI/CD** pipelines, allowing you to spin up Docker containers on demand for each test run. You can integrate this into your pipeline with any CI tool (e.g., GitHub Actions, GitLab CI, Jenkins, etc.) by ensuring Docker is installed and accessible.

### Example GitHub Actions Workflow:

```yaml
name: Run Node.js Tests with Testcontainers

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:latest
        ports:
          - 5432:5432
        options: >-
          --health-cmd='pg_isready -U postgres'
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "14"
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npx jest
```

In this workflow, GitHub Actions will:

- Use Docker to run a PostgreSQL container.
- Set up Node.js, install dependencies, and run the tests.
