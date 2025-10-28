const amqp = require("amqplib");
const config = require("../config");
const OrderService = require("../services/orderService");
const logger = require("./logger");

class MessageBroker {
  static async connect() {
    try {
      const connection = await amqp.connect(config.rabbitMQUrl);
      const channel = await connection.createChannel();

      // Declare the order queue
      await channel.assertQueue(config.rabbitMQQueue, { durable: true });

      // Consume messages from the order queue on buy
      channel.consume(config.rabbitMQQueue, async (message) => {
        try {
          const order = JSON.parse(message.content.toString());
          const orderService = new OrderService();
          await orderService.createOrder(order);
          channel.ack(message);
        } catch (error) {
          logger.error(error);
          channel.reject(message, false);
        }
      });
      logger.log(`Started consuming from ${config.rabbitMQQueue}`);
    } catch (error) {
      logger.error(error);
    }
  }
}

module.exports = MessageBroker;
