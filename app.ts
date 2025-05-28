import express, { Response, Request } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import morgan from "morgan";
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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World! v2");
});

export default app;
