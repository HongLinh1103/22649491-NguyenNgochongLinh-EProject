require("dotenv").config();

module.exports = {
  // Accept service-specific or generic env var names so the app works both
  // under Docker Compose and when run locally.
  mongoURI:
    process.env.MONGODB_AUTH_URI || process.env.MONGODB_URI ||
    "mongodb://mongodb:27017/authdb",
  jwtSecret: process.env.JWT_SECRET || "secret",
};