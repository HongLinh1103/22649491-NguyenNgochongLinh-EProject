const AuthService = require("../services/authService");
const logger = require("../utils/logger");

/**
 * Class to encapsulate the logic for the auth routes
 */

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  async login(req, res) {
    const { username, password } = req.body;

    const result = await this.authService.login(username, password);

    if (result.success) {
      logger.log(`User logged in: ${username}`);
      res.json({ token: result.token });
    } else {
      logger.error(`Login failed for ${username}: ${result.message}`);
      res.status(400).json({ message: result.message });
    }
  }

  async register(req, res) {
    const user = req.body;
  
    try {
      const existingUser = await this.authService.findUserByUsername(user.username);
  
      if (existingUser) {
        logger.error("Username already taken", user.username)
        throw new Error("Username already taken");
      }
  
      const result = await this.authService.register(user);
      logger.log(`User registered: ${result.username || user.username}`);
      res.json(result);
    } catch (err) {
      logger.error(`Register error for ${user.username}: ${err.message}`);
      res.status(400).json({ message: err.message });
    }
  }

  async getProfile(req, res) {
    const userId = req.user.id;

    try {
      const user = await this.authService.getUserById(userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
}

module.exports = AuthController;
