const logger = require('../utils/logger');

function maskBody(body) {
  if (!body) return body;
  const copy = { ...body };
  if (copy.password) copy.password = '***';
  return copy;
}

module.exports = function requestLogger(req, res, next) {
  const start = Date.now();
  const maskedBody = maskBody(req.body);
  // capture response body
  let oldSend = res.send;
  let responseBody;
  res.send = function (body) {
    responseBody = body;
    return oldSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    let respToLog = responseBody;
    try {
      if (typeof responseBody === 'string') respToLog = JSON.parse(responseBody);
    } catch (e) {}
    logger.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - reqBody=${JSON.stringify(maskedBody)} - resBody=${JSON.stringify(respToLog)}`);
  });

  next();
};
