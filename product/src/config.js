require("dotenv").config();

module.exports = {
  // Cổng server
  port: process.env.PORT || 3001,

  // MongoDB (thay đổi nếu cần)
  mongoURI: process.env.MONGODB_PRODUCT_URI || "mongodb://localhost/products",

  // RabbitMQ
  rabbitMQURI: process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672",

  // Tên exchange và queue RabbitMQ
  exchangeName: "products",
  queueName: "products_queue",
};
