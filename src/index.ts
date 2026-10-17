import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: [config.frontendUrl, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Base route
app.get("/", (_req, res) => {
  res.json({
    name: "Foundation Backend API",
    version: "1.0.0",
    docs: "/api/health",
  });
});

// API Routes
app.use("/api", apiRouter);

// Global Error Handler
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(`
🚀 Server ready at: http://localhost:${config.port}
🩺 Health check at: http://localhost:${config.port}/api/health
👥 Users API at:   http://localhost:${config.port}/api/users
`);
});

export default app;
