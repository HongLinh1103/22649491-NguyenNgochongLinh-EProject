const express = require("express");
const mongoose = require("mongoose");
const config = require("./config");
const MessageBroker = require("./utils/messageBroker");
const productsRouter = require("./routes/productRoutes");
require("dotenv").config();

class App {
  constructor(options = {}) {
    this.app = express();
    this.setMiddlewares();
    this.setRoutes();
    // Skip RabbitMQ in test environment
    if (!options.skipMessageBroker && process.env.NODE_ENV !== 'test') {
      this.setupMessageBroker();
    }
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
    this.app.use("/api/products", productsRouter);
  }

  setupMessageBroker() {
    MessageBroker.connect();
  }

  start(port) {
    const listenPort = (typeof port === 'number')
      ? port
      : (process.env.PORT ? Number(process.env.PORT) : 3001);
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
