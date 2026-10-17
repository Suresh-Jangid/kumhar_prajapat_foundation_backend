import dotenv from "dotenv";

// Prefer Neon CLI's local variables, with .env as fallback.
dotenv.config({ path: [".env.local", ".env"] });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:3000",
  databaseUrl: process.env.DATABASE_URL || "",
};
