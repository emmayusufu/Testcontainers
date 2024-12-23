import { Pool } from "pg";
import { RedisContainer, StartedRedisContainer } from "@testcontainers/redis";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import { createClient, RedisClientType } from "redis";

class DatabaseManager {
  private static instance: DatabaseManager | null = null;
  private pool: Pool;
  private testContainer?: StartedPostgreSqlContainer;

  private constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      database: process.env.DB_NAME || "testdb",
    });
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
      this.pool = new Pool({
        host: this.testContainer.getHost(),
        port: this.testContainer.getPort(),
        user: this.testContainer.getUsername(),
        password: this.testContainer.getPassword(),
        database: this.testContainer.getDatabase(),
      });
    }

    // Test connection
    const client = await this.pool.connect();
    await client.query("SELECT NOW()");
    client.release();
  }

  async disconnect(): Promise<void> {
    await this.pool.end();
    if (this.testContainer) {
      await this.testContainer.stop();
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}

class RedisManager {
  private static instance: RedisManager | null = null;
  private client: RedisClientType;
  private testContainer?: StartedRedisContainer;

  private constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
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
