import "dotenv/config";
import express from "express";

import db from "./db/db_config.js";
import mainRouter from "./src/api/main.routes.js";
import errorHandler from "./src/middleware/errorHandler.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());
app.use("/api", mainRouter);
app.use(errorHandler);

// Test database connection
async function startServer() {
  try {
    const connection = await db.getConnection();
    console.log("Database connection successful");
    connection.release();

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
