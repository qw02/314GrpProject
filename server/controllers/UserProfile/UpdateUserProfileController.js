import { UpdateUserProfileEntity } from '../../entities/UserProfile/UpdateUserProfileEntity.js';
import { UserProfileModel } from '../../models/UserProfileModel.js';
import pool from '../../db.js';

/**
 * Controller for updating user profile details.
 */
export class UpdateUserProfileController {
  /** @type {UpdateUserProfileEntity} */
  updateUserProfileEntity;

  constructor() {
    this.updateUserProfileEntity = new UpdateUserProfileEntity(pool);
  }

  /**
   * Handles PUT /api/useradmin/profile/:username/
   * Expects profile fields (firstName, lastName, email, phoneNumber) in the body.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateProfile = async (req, res) => {
    const { username } = req.params;
    const { firstName, lastName, email, phoneNumber } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }
    // Basic email format check if email is provided
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format provided.' });
    }

    // Create a model with only the fields provided in the request body
    const profileModel = new UserProfileModel(
      username,
      req.body.hasOwnProperty('firstName') ? firstName : undefined,
      req.body.hasOwnProperty('lastName') ? lastName : undefined,
      req.body.hasOwnProperty('email') ? email : undefined,
      req.body.hasOwnProperty('phoneNumber') ? phoneNumber : undefined
    );

    try {
      const success = await this.updateUserProfileEntity.updateProfile(profileModel);
      if (success) {
        res.status(200).json({ message: `Profile for user '${username}' updated successfully.` });
      } else {
        res.status(404).json({ message: `User profile for '${username}'.` });
      }
    } catch (error) {
      console.error('Update user profile controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during profile update.' });
    }
  }
}