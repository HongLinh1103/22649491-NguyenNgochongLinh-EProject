const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();

// Basic proxy error handling to avoid silent failures
proxy.on("error", (err, req, res) => {
  console.error("[API Gateway] Proxy error:", err.message);
  if (!res.headersSent) {
    res.statusCode = 502;
    res.end(JSON.stringify({ message: "Bad Gateway", error: err.message }));
  }
});

// Helper to strip prefix before proxying to target service
function mountService(prefix, target) {
  app.use(prefix, (req, res) => {
    // Remove the service prefix from the path so downstream services receive the expected route
    req.url = req.url.replace(new RegExp(`^${prefix}`), "");
    proxy.web(req, res, { target, changeOrigin: true });
  });
}

// Use environment overrides when available (useful for Docker).
// Prefer service DNS names when running under Docker Compose so the gateway
// connects to other containers on the compose network instead of localhost.
const AUTH_TARGET = process.env.AUTH_SERVICE_URL || process.env.AUTH_URL || "http://auth:3000";
const PRODUCT_TARGET = process.env.PRODUCT_SERVICE_URL || process.env.PRODUCT_URL || "http://product:3001";
const ORDER_TARGET = process.env.ORDER_SERVICE_URL || process.env.ORDER_URL || "http://order:3002";

// Route requests to the respective services via prefix
mountService("/auth", AUTH_TARGET);
mountService("/products", PRODUCT_TARGET);
mountService("/orders", ORDER_TARGET);

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
