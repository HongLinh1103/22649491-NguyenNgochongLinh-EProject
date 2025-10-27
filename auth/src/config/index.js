require("dotenv").config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || "mongodb://localhost:27017/authdb",
  jwtSecret: process.env.JWT_SECRET || "secret",
};