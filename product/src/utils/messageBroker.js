const amqp = require("amqplib");
const config = require("../config");
const logger = require("./logger");

class MessageBroker {
  constructor() {
    this.channel = null;
    this.connection = null;
    this.retryInterval = 5000; // 5 giây
  }

  async connect() {
    logger.log("Connecting to RabbitMQ...");
    setTimeout( async() =>{
    while (!this.channel) {
      try {
        this.connection = await amqp.connect(config.rabbitMQURI);
        this.channel = await this.connection.createChannel();
        await this.channel.assertQueue(config.queueName);
        logger.log("✅ RabbitMQ connected");
      } catch (err) {
        logger.error(
          `Failed to connect to RabbitMQ: ${err.message}. Retrying in ${this.retryInterval /
            1000}s...`
        );
        await this.sleep(this.retryInterval);
      }
    }}, 20000)
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async publishMessage(queue, message) {
    if (!this.channel) {
      logger.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
      logger.log(`Message published to queue "${queue}"`);
    } catch (err) {
      logger.error("Failed to publish message:", err.message);
    }
  }

  async consumeMessage(queue, callback) {
    if (!this.channel) {
      logger.error("No RabbitMQ channel available.");
      return;
    }

    try {
      await this.channel.consume(queue, (message) => {
        if (message) {
          const content = message.content.toString();
          const parsedContent = JSON.parse(content);
          callback(parsedContent);
          this.channel.ack(message);
        }
      });
      logger.log(`Started consuming messages from queue "${queue}"`);
    } catch (err) {
      logger.error("Failed to consume messages:", err.message);
    }
  }

  async disconnect() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    logger.log("RabbitMQ disconnected");
  }
}

module.exports = new MessageBroker();