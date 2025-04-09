import { CreateUserProfileEntity } from '../../entities/UserProfile/CreateUserProfileEntity.js';
import { UserProfileModel } from '../../models/UserProfileModel.js';
import pool from '../../db.js';

/**
 * Controller for creating user profiles.
 */
export class CreateUserProfileController {
  /** @type {CreateUserProfileEntity} */
  createUserProfileEntity;

  constructor() {
    this.createUserProfileEntity = new CreateUserProfileEntity(pool);
  }

  /**
   * Handles POST /api/useradmin/profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createProfile = async (req, res) => {
    const { username, firstName, lastName, email, phoneNumber } = req.body;

    // Basic email format check (very simple)
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ message: 'Invalid email format provided.' });
    }


    const profileModel = new UserProfileModel(username, firstName, lastName, email, phoneNumber);

    try {
      const success = await this.createUserProfileEntity.createProfile(profileModel);
      if (success) {
        res.status(200).json({ message: `User profile for '${username}' created successfully.` });
      } else {
        res.status(409).json({ message: `User profile for '${username}' already exists, or no user account yet.` });
      }
    } catch (error) {
      console.error('Create user profile controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during profile creation.' });
    }
  }
}