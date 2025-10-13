const express = require("express");
const httpProxy = require("http-proxy");

const proxy = httpProxy.createProxyServer();
const app = express();
app.get("/", (req, res) => {
  console.log('sdsdsdsdsdsd')
  res.send("API Gateway is running");
} )
// Route requests to the auth service
app.use("/auth", (req, res) => {
  req.url = req.url.replace(/^\/auth/, ''); // Remove /auth prefix
  
  
  proxy.web(req, res, { target: "http://localhost:3000" });
});

// Route requests to the product service
app.use("/products", (req, res) => {
  req.url  = req.url.replace(/^\/products/, '');
  proxy.web(req, res, { target: "http://localhost:3001" });
});

// Route requests to the order service
app.use("/orders", (req, res) => {
  proxy.web(req, res, { target: "http://localhost:3002" });
});

// Start the server
const port = process.env.PORT || 3003;
app.listen(port, () => {
  console.log(`API Gateway listening on port http://localhost:${port}`);
});
