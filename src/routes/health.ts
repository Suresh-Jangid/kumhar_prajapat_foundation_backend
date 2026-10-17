import { Router, Request, Response } from "express";
import { db } from "../db/client.js";

export const healthRouter = Router();

healthRouter.get("/", async (_req: Request, res: Response) => {
  try {
    // Check PostgreSQL connection
    await db.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "healthy",
      service: "foundation-backend",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(503).json({
      status: "degraded",
      service: "foundation-backend",
      database: "disconnected",
      error: error.message || "Cannot connect to database",
      tip: "Verify that PostgreSQL is running and DATABASE_URL in .env.local or .env is set.",
      timestamp: new Date().toISOString(),
    });
  }
});
