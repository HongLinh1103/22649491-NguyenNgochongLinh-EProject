require("dotenv").config();

module.exports = {
  // Cổng server
  port: process.env.PORT || 3001,

  // MongoDB (thay đổi nếu cần) - when running in Docker the mongo host is `mongo`
  // Use the existing DB name `productdb` to keep previously created documents
  mongoURI: process.env.MONGODB_URI || "mongodb://mongo:27017/productdb",

  // RabbitMQ - default to docker service name when running in docker-compose
  rabbitMQURI: process.env.RABBITMQ_URL || "amqp://rabbitmq",

  // Tên exchange và queue RabbitMQ
  // exchangeName: "products",
  queueName: "products",
};
