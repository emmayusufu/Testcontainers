import http from "http";
import app from "./app";
import { db, redis } from "./managers";

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

(async function () {
  try {
    await db.connect();
    await redis.connect();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();

process.on("SIGTERM", async () => {
  await db.disconnect();
  await redis.disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
