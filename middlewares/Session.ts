import Session from "express-session";

const sessionSettings = Session({
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
