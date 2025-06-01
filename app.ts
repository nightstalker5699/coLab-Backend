import express, { Response, Request, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/AuthRouter";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/UserRouter";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
const app = express();

app.use(morgan("dev")); // Logging middleware
app.use(
  cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
  })
);
app.options("/*flight", cors()); // Enable pre-flight requests for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(cookieParser());

app.use("/api/users", UserRouter);
app.use("/api", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use((error: any, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", error);
  res.status(error.statusCode || 500).json({
    status: error.status || "error",
    message: error.message || "Internal Server Error",
  });
});

export default app;
