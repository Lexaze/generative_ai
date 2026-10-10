import "dotenv/config";
import express from "express";

import db from "./db/db_config.js";
import mainRouter from "./src/api/main.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/api", mainRouter);
app.use(errorHandler);

// Confirm database access before accepting API requests.
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connection successful");
    connection.release();

    // Start accepting requests after confirming the database is reachable.
    app.listen(3777, (err) => {
      if (err) {
        throw err;
      }
      console.log("Server is running on port http://localhost:3777");
    });
  } catch (error) {
    console.log("Error in connecting to the database", error.message);
  }
}
startServer();
