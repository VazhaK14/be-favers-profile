import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { logger } from "hono/logger";
import { globalErrorHandler } from "./lib/errorHandler.js";
import authRouter from "./routes/auth/index.js";

// Routes

const app = new Hono();

// Global Middlewares
app.onError(globalErrorHandler);
app.use("*", logger());
app.use("*", secureHeaders());
app.use(
  "*",
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    credentials: true,
  }),
);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// API routes
app.get("/api/health", (c) => c.json({ status: "ok" }));
app.route("/api/auth", authRouter);

app.get("/", (c) => {
  return c.text("Hello Favers!");
});

// Export the Hono instance for testing
export { app };

// Default export for Bun
export default {
  port: process.env.PORT || 3001,
  fetch: app.fetch,
};
