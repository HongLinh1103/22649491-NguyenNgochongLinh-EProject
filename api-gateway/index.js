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

// Route requests to the respective services via prefix
mountService("/auth", "http://localhost:3000");
mountService("/products", "http://localhost:3001");
mountService("/orders", "http://localhost:3002");

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port ${port}`);
});
