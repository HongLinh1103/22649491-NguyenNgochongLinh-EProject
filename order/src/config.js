require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_ORDER_URI || 'mongodb://localhost:27017/orderdb',
  rabbitMQURI: process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672',
  rabbitMQQueue: 'orders',
  port: process.env.PORT || 3002
};