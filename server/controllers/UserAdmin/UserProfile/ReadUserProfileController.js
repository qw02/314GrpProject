import { UserProfileEntity } from '../../../entities/UserProfileEntity.js';
import pool from '../../../db.js';

/**
 * Controller for reading user profile details.
 */
export class ReadUserProfileController {
  /** @type {UserProfileEntity} */
  userProfileEntity;

  constructor() {
    this.userProfileEntity = new UserProfileEntity(pool);
  }

  /**
   * Handles GET /api/useradmin/profile/:username/
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getProfile = async (req, res) => {
    const { username } = req.params;

    try {
      const userProfile = await this.userProfileEntity.getUserProfile(username);
      if (userProfile) {
        res.status(200).json(userProfile);
      } else {
        res.status(500).json(null);
      }
    } catch (error) {
      res.status(500).json(null);
    }
  }
}