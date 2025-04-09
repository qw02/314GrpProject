import { DeleteUserProfileEntity } from '../../entities/UserProfile/DeleteUserProfileEntity.js';
import pool from '../../db.js';

/**
 * Controller for handling the deletion of user profiles.
 */
export class DeleteUserProfileController {
  /** @type {DeleteUserProfileEntity} */ // Updated type
  deleteUserProfileEntity;

  constructor() {
    // Instantiate the correct entity
    this.deleteUserProfileEntity = new DeleteUserProfileEntity(pool);
  }

  /**
   * Handles DELETE /api/useradmin/profile/:username/
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  deleteProfile = async (req, res) => {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }

    try {
      const success = await this.deleteUserProfileEntity.deleteProfile(username);
      if (success) {
        res.status(200).json({ message: `User profile for '${username}' deleted successfully.` });
      } else {
        res.status(404).json({ message: `User profile for '${username}' not found.` });
      }
    } catch (error) {
      console.error('Delete user profile controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during profile deletion.' });
    }
  }
}
