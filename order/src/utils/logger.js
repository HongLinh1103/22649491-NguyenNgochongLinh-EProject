const serviceName = process.env.SERVICE_NAME || 'order-service';

module.exports = {
  log: (...args) => console.log(`[${serviceName}]`, ...args),
  info: (...args) => console.log(`[${serviceName}]`, ...args),
  error: (...args) => console.error(`[${serviceName}]`, ...args),
};
