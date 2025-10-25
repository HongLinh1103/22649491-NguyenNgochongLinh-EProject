const AuthService = require("../services/authService");

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
      res.json({ token: result.token });
    } else {
      res.status(400).json({ message: result.message });
    }
  }

  async register(req, res) {
    const user = req.body;
    console.log("AuthController.register called with", user);
    try {
      const existingUser = await this.authService.findUserByUsername(user.username);

      if (existingUser) {
        console.log("Username already taken");
        return res.status(400).json({ message: "Username already taken" });
      }

      const result = await this.authService.register(user);
      console.log("AuthController.register created user:", { id: result._id, username: result.username });
      res.json(result);
    } catch (err) {
      console.error("AuthController.register error:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
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
