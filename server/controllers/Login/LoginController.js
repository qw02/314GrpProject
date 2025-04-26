import { LoginEntity } from '../../entities/LoginEntity.js';
import { User } from '../../models/User.js';
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

    const userModel = new User(username, password, role);

    try {
      const validatedUser = await this.loginEntity.verifyCredentials(userModel);

      if (validatedUser) {
        res.status(200).json({ username: validatedUser.username, role: validatedUser.role });
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }
}