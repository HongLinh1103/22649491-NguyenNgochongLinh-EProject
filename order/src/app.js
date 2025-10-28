const express = require("express");
const mongoose = require("mongoose");
const Order = require("./models/order");
const amqp = require("amqplib");
const config = require("./config");

class App {
  constructor() {
    this.app = express();
    this.connectDB();
    // request/response logging for any HTTP routes
    const requestLogger = require('./middlewares/requestLogger');
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));
    this.app.use(requestLogger);

    this.setupOrderConsumer();
  }

  async connectDB() {
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const logger = require('./utils/logger');
    logger.log("MongoDB connected");
  }

  async disconnectDB() {
    await mongoose.disconnect();
    console.log("MongoDB disconnected");
  }

  async setupOrderConsumer() {
  const logger = require('./utils/logger');
  logger.log("Connecting to RabbitMQ...");

    setTimeout(async () => {
      try {
  // ✅ Dùng biến từ config thay vì hardcode
  logger.log("RabbitMQ URI:", 'amqp://rabbitmq');

  const connection = await amqp.connect('amqp://rabbitmq');
  logger.log("Connected to RabbitMQ");

        const channel = await connection.createChannel();
        await channel.assertQueue(config.rabbitMQQueue);

        channel.consume(config.rabbitMQQueue, async (data) => {
          logger.log("Consuming ORDER service");
          const { products, username, orderId } = JSON.parse(data.content);

          const newOrder = new Order({
            products,
            user: username,
            totalPrice: products.reduce((acc, product) => acc + product.price, 0),
          });

          await newOrder.save();
          channel.ack(data);
          logger.log("Order saved to DB and ACK sent to ORDER queue");

          // Send fulfilled order to PRODUCTS service
          const { user, products: savedProducts, totalPrice } = newOrder.toJSON();
          channel.sendToQueue(
            "products",
            Buffer.from(JSON.stringify({ orderId, user, products: savedProducts, totalPrice }))
          );
        });
      } catch (err) {
        console.error("Failed to connect to RabbitMQ:", err.message);
      }
    }, 20000);
  }

  start() {
    const logger = require('./utils/logger');
    this.server = this.app.listen(config.port, () =>
      logger.log(`Server started on port ${config.port}`)
    );
  }

  async stop() {
    await mongoose.disconnect();
    this.server.close();
    const logger = require('./utils/logger');
    logger.log("Server stopped");
  }
}

module.exports = App;
