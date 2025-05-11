import { UserProfileEntity } from '../../../entities/UserProfileEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the deletion of user profiles.
 */
export class DeleteUserProfileController {
  /** @type {UserProfileEntity} */ // Updated type
  userProfileEntity;

  constructor() {
    // Instantiate the correct entity
    this.userProfileEntity = new UserProfileEntity(pool);
  }

  /**
   * Handles DELETE /api/useradmin/profile/:username/
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  deleteProfile = async (req, res) => {
    const { username } = req.params;

    try {
      const success = await this.userProfileEntity.deleteProfile(username);
      if (success) {
        res.status(200).json(true);
      } else {
        res.status(500).json(false);
      }
    } catch (error) {
      res.status(500).json(false);
    }
  }
}
