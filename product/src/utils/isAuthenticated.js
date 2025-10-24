const jwt = require("jsonwebtoken");
require("dotenv").config();

function isAuthenticated(req, res, next) {
  // Check for the presence of an authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Extract the token from the header
  const token = authHeader.split(" ")[1];

  try {
    // Verify the token using the JWT library and the secret key
    // Use fallback secret for testing if JWT_SECRET is not set
    const secret = process.env.JWT_SECRET || "supersecret";
    const decodedToken = jwt.verify(token, secret);
    req.user = decodedToken;
    console.log(req.user);
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = isAuthenticated;
