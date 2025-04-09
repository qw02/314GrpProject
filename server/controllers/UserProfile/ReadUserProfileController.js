import { ReadUserProfileEntity } from '../../entities/UserProfile/ReadUserProfileEntity.js';
import pool from '../../db.js';

/**
 * Controller for reading user profile details.
 */
export class ReadUserProfileController {
  /** @type {ReadUserProfileEntity} */
  readUserProfileEntity;

  constructor() {
    this.readUserProfileEntity = new ReadUserProfileEntity(pool);
  }

  /**
   * Handles GET /api/useradmin/profile/:username/
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getProfile = async (req, res) => {
    const { username } = req.params;

    if (!username ) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }

    try {
      const userProfile = await this.readUserProfileEntity.getUserProfile(username);
      if (userProfile) {
        res.status(200).json(userProfile);
      } else {
        res.status(404).json({ message: `User profile for '${username}' not found.` });
      }
    } catch (error) {
      console.error('Read user profile controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error while fetching profile.' });
    }
  }
}