import express, { Response, Request, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
import authRouter from "./routes/AuthRouter";
import cookieParser from "cookie-parser";
import Session from "express-session";
import UserRouter from "./routes/UserRouter";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import passport from "./helpers/authhandler";
import { log } from "console";
import { validateSession } from "./middlewares/protectRoute";
const app = express();

app.use(morgan("dev")); // Logging middleware
app.use(
  cors({
    origin: [
      "http://localhost:5500",
      "http://127.0.0.1:5500",
      "http://localhost:8000",
    ], // Allow all origins
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.options("/*flight", cors()); // Enable pre-flight requests for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.use(
  Session({
    secret: process.env.SESSION_SECRET || "test",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
      sameSite: "lax", // Helps prevent CSRF attacks
    },
  })
);
app.use(passport.initialize());
app.use(passport.session()); // Initialize passport session
app.use(cookieParser());
app.use(validateSession); // Middleware to validate user session
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
