import Session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";

export const redisClient = createClient({
  socket: {
    host: process.env.NODE_ENV === "test" ? "localhost" : "redis",
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

export const sessionDeleter = async (userId: string) => {
  const keys = await redisClient.keys("sessions:*");
  for (const key of keys) {
    const sessionData = await redisClient.get(key);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session.passport && session.passport.user.id === userId) {
        await redisClient.del(key);
      }
    }
  }
  console.log("deleted all related sessions");
};
