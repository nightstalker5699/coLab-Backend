import Session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

const redisClient = createClient({
  socket: {
    host: "redis",
    port: 6379,
  },
});

// Handle Redis connection
redisClient.on("error", (err) => {
  console.error("Redis Client Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connected to Redis");
});

redisClient.connect().catch(console.error);

let store = new RedisStore({
  client: redisClient,
  prefix: "sessions:",
});
const sessionSettings = Session({
  store: store,
  secret: process.env.SESSION_SECRET || "test",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    maxAge: 24 * 60 * 60 * 1000, // Cookie expiration time (1 day)
    sameSite: "lax", // Helps prevent CSRF attacks
  },
});

export default sessionSettings;
