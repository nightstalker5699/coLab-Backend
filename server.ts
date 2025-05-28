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
const server = app.listen(process.env.PORT, () => {
  console.log(`App running on port ${process.env.PORT}`);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection shutting down");
  console.error(err);
  // Optionally, you can exit the process or handle the error gracefully
  process.exit(1);
});
