require('dotenv').config();

module.exports = {
  mongoURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/orderdb',
  rabbitMQURI: process.env.RABBITMQURI || 'amqp://guest:guest@localhost:5672',
  rabbitMQQueue: 'orders',
  port: process.env.PORT || 3002
};