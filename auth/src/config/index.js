require("dotenv").config();

module.exports = {
  // default to docker mongo service host when running in docker-compose
  mongoURI: process.env.MONGODB_URI || "mongodb://mongo:27017/authdb",
  jwtSecret: process.env.JWT_SECRET || "secret",
};