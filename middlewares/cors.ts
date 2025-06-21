import cors from "cors";

const corsSettings = cors({
  origin: [
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
  ], // Allow all origins
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow specific methods
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
});

export default corsSettings;
