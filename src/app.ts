import express, { Request, Response } from "express";
import { db, redis } from "./managers";

const app = express();
app.use(express.json());

// Error handler middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something broke!" });
  }
);

// Get all users
app.get("/users", async (req: Request, res: Response) => {
  try {
    const pool = db.getPool();
    const result = await pool.query("SELECT * FROM users ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Get user by ID
app.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const redisClient = redis.getClient();
    const cached = await redisClient.get(`user:${req.params.id}`);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const pool = db.getPool();
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await redisClient.set(
      `user:${req.params.id}`,
      JSON.stringify(result.rows[0]),
      {
        EX: 3600,
      }
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Create user
app.post("/users", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const pool = db.getPool();
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create user" });
  }
});

// Update user
app.put("/users/:id", async (req: Request, res: Response) => {
  const { name, email } = req.body;

  if (!name && !email) {
    return res.status(400).json({ error: "Name or email is required" });
  }

  try {
    const pool = db.getPool();
    const result = await pool.query(
      "UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email) WHERE id = $3 RETURNING *",
      [name, email, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Invalidate cache
    const redisClient = redis.getClient();
    await redisClient.del(`user:${req.params.id}`);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Delete user
app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const pool = db.getPool();
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Invalidate cache
    const redisClient = redis.getClient();
    await redisClient.del(`user:${req.params.id}`);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default app;
