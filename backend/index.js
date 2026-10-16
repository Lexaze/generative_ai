import "dotenv/config";
import express from "express";
import cors from "cors";

import db from "./db/db_config.js";
import mainRouter from "./src/api/main.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";

const app = express();

// 1. Robust CORS configuration handling both production and preview deployments
const allowedOrigins = ["https://generative-ai-ten.vercel.app"];

// Fallback to push extra origins from environment dashboard if needed
if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow server-to-server or local automated test tools (no origin)
      if (!origin) return callback(null, true);

      // Match explicit domains OR allow any dynamically generated Vercel branch preview URL
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      } else {
        return callback(new Error("Blocked by CORS security policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// 2. Global body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (Useful to keep Render web services awake)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// 3. Routing (Note: This forces all routes from mainRouter to be prefixed with /api)
app.use("/api", mainRouter);

// 4. Global Error Handling Middleware (must be registered last)
app.use(errorHandler);

const PORT = process.env.PORT || 3777;

// 5. Orderly Startup Sequence
async function startServer() {
  try {
    // Verify database connection is alive before launching network interface
    const connection = await db.getConnection();
    console.log("🚀 Database connection successfully established.");
    connection.release();

    app.listen(PORT, () => {
      console.log(`📡 Server actively listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error(
      "❌ Fatal: Failed to establish database connection during initialization:",
      error,
    );
    // Exit application loop since backend cannot perform functional logic without DB access
    process.exit(1);
  }
}

startServer();
