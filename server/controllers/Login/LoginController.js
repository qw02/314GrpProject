import { LoginEntity } from '../../entities/Login/LoginEntity.js';
import { UserModel } from '../../models/UserModel.js';
import pool from '../../db.js';

/**
 * Handles login requests, interacts with LoginEntity, and sends HTTP responses.
 */
export class LoginController {
  /** @type {LoginEntity} */
  loginEntity;

  constructor() {
    this.loginEntity = new LoginEntity(pool);
  }

  /**
   * Handles the POST /login request.
   * @param {import('express').Request} req - Express request object.
   * @param {import('express').Response} res - Express response object.
   */
  login = async (req, res) => {
    const { username, password, role } = req.body;

    // Basic validation
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required.' });
    }
    // Validate role value
    const validRoles = ['UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified.' });
    }

    const userModel = new UserModel(username, password, role);

    try {
      const validatedUser = await this.loginEntity.verifyCredentials(userModel);

      if (validatedUser) {
        res.status(200).json({ username: validatedUser.username, role: validatedUser.role });
      } else {
        res.status(401).json({ message: 'Invalid username, password, or role, or account inactive.' });
      }
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({ message: error.message || 'An internal server error occurred during login.' });
    }
  }
}