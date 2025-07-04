import express, { Response, Request, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import corsSettings from "./middlewares/cors";
import morgan from "morgan";
import authRouter from "./routes/AuthRouter";
import UserRouter from "./routes/UserRouter";
import teamRouter from "./routes/teamRouter";
import cookieParser from "cookie-parser";
import session from "./middlewares/Session";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swagger";
import passport from "./helpers/authhandler";
import { protect, validateSession } from "./middlewares/protectRoute";
import { errorHandler } from "./helpers/errorHandler";
const app = express();

app.use(morgan("dev")); // Logging middleware
app.use(corsSettings);
app.options("/*flight", cors()); // Enable pre-flight requests for all routes

app.use(express.json()); // convert json to req object

app.use(express.urlencoded({ extended: true }));

app.use(session);

app.use(passport.initialize());

app.use(passport.session()); // Initialize passport session

app.use(cookieParser());

// app.use(validateSession); // Middleware to validate user session
app.use("/api", authRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(protect);
app.use("/api/users", UserRouter);
app.use("/api/teams", teamRouter);

app.use(errorHandler);

export default app;
