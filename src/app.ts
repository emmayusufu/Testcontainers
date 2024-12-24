import express, { Request, Response } from "express";
import { db, redis } from "./managers";

const app = express();

app.use(express.json());

// Error handler middleware
/**
 * Error handling middleware that catches errors during request processing.
 * Logs the error stack and responds with a 500 status code and a generic error message.
 *
 */
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

/**
 * Get all users.
 *
 * This route fetches all users from the database and returns them as a JSON response.
 * If an error occurs during the database query, a 500 status code and an error message are returned.
 */
app.get("/users", async (req: Request, res: Response) => {
  try {
    const pool = db.getPool();
    const result = await pool.query("SELECT * FROM users ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * Get a user by ID.
 *
 * This route fetches a specific user by ID from the database. If the user is found in Redis cache, it is returned from there.
 * If not, it queries the database and caches the result in Redis for future use.
 * If the user is not found, a 404 status code is returned.
 *
 */
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
        EX: 3600, // Cache expiration time in seconds (1 hour)
      }
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

/**
 * Create a new user.
 *
 * This route allows the creation of a new user by providing the `name` and `email` in the request body.
 * If any required fields are missing, a 400 status code is returned with an error message.
 * On success, the new user is inserted into the database and returned as a JSON object.
 *
 */
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

/**
 * Update an existing user by ID.
 *
 * This route allows updating an existing user's `name` and/or `email`. If neither field is provided, a 400 status code is returned.
 * On success, the updated user is returned. If no user is found by the provided ID, a 404 status code is returned.
 *
 */
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

    // Invalidate cache after update
    const redisClient = redis.getClient();
    await redisClient.del(`user:${req.params.id}`);

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

/**
 * Delete a user by ID.
 *
 * This route deletes an existing user from the database by the given ID. If the user is successfully deleted,
 * a success message is returned. If no user is found by the provided ID, a 404 status code is returned.
 */
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

    // Invalidate cache after deletion
    const redisClient = redis.getClient();
    await redisClient.del(`user:${req.params.id}`);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Export the Express app for use in other modules
export default app;
