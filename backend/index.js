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

const PORT = process.env.PORT || 3777;

async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connection successful");
    connection.release();
  } catch (error) {
    console.error("Error in connecting to the database:", error);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

startServer();
