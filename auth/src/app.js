const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const authMiddleware = require("./middlewares/authMiddleware");
const AuthController = require("./controllers/authController");

class App {
  constructor() {
    this.app = express();
    this.authController = new AuthController();
    this.setMiddlewares();
    this.setRoutes();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  setMiddlewares() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
  }

  setRoutes() {
    this.app.post("/login", (req, res) => this.authController.login(req, res));
    this.app.post("/register", (req, res) => this.authController.register(req, res));
    this.app.get("/dashboard", authMiddleware, (req, res) => res.json({ message: "Welcome to dashboard" }));
  }

  start(port) {
    const listenPort = (typeof port === 'number')
      ? port
      : (process.env.PORT ? Number(process.env.PORT) : 3000);
    this.server = this.app.listen(listenPort, () => {
      const actualPort = this.server.address().port;
      console.log(`Server started on port ${actualPort}`);
    });
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    console.log("Server stopped");
  }
}

module.exports = App;
