process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Optionally, you can exit the process or handle the error gracefully
  process.exit(1);
});

import dotenv from "dotenv";
import app from "./app";
import databaseSetup from "./helpers/databaseSetup";
dotenv.config({ path: "./.env" });

databaseSetup(); // Set up the database

// server creation
const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log(
    `API Documentation available at http://localhost:${port}/api-docs`
  );
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection shutting down");
  console.error(err);
  // Optionally, you can exit the process or handle the error gracefully
  process.exit(1);
});
