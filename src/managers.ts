import { Client, QueryResult } from "pg";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { createClient, RedisClientType } from "redis";

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private client: Client;
  private testContainer?: StartedPostgreSqlContainer;

  private constructor() {
    const config = {
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
    };
    this.client = new Client(config);
  }

  static getInstance(): DatabaseManager {
    if (!this.instance) {
      this.instance = new DatabaseManager();
    }
    return this.instance;
  }

  async connect(isTest = false): Promise<void> {
    if (isTest) {
      this.testContainer = await new PostgreSqlContainer().start();
      this.client = new Client({
        host: this.testContainer.getHost(),
        port: this.testContainer.getPort(),
        user: this.testContainer.getUsername(),
        password: this.testContainer.getPassword(),
        database: this.testContainer.getDatabase(),
      });
    }

    await this.client.connect();
    console.log("Database connected successfully");
    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await this.client.query(createUsersTableQuery);
  }

  async disconnect(): Promise<void> {
    await this.client.end();
    if (this.testContainer) {
      await this.testContainer.stop();
    }
  }

  getClient() {
    return this.client;
  }

  clearTable(tableName: string = "users"): Promise<QueryResult<any>> {
    return this.client.query(`DELETE FROM ${tableName}`);
  }
}

class RedisManager {
  private static instance: RedisManager | null = null;
  private client: RedisClientType;
  private testContainer?: StartedRedisContainer;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
    });
  }

  static getInstance(): RedisManager {
    if (!this.instance) {
      this.instance = new RedisManager();
    }
    return this.instance;
  }

  async connect(isTest = false): Promise<void> {
    if (isTest) {
      this.testContainer = await new RedisContainer().start();
      this.client = createClient({
        url: this.testContainer.getConnectionUrl(),
      });
    }

    await this.client.connect();
    console.log("Redis connected successfully");
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
    if (this.testContainer) {
      await this.testContainer.stop();
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}

export const db = DatabaseManager.getInstance();
export const redis = RedisManager.getInstance();
