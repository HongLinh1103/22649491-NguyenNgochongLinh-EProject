require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://mongo:27017/orderdb',
  rabbitMQURI: process.env.RABBITMQURI || 'amqp://rabbitmq',
  rabbitMQQueue: 'orders',
  port: process.env.PORT || 3002
};