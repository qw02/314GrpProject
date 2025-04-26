import { UserProfileEntity } from '../../entities/UserProfileEntity.js';
import { UserProfile } from '../../models/UserProfile.js';
import pool from '../../db.js';

/**
 * Controller for creating user profiles.
 */
export class CreateUserProfileController {
  /** @type {UserProfileEntity} */
  userProfileEntity;

  constructor() {
    this.userProfileEntity = new UserProfileEntity(pool);
  }

  /**
   * Handles POST /api/useradmin/profile
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createProfile = async (req, res) => {
    const { username, firstName, lastName, email, phoneNumber } = req.body;

    const profileModel = new UserProfile(username, firstName, lastName, email, phoneNumber);

    try {
      const success = await this.userProfileEntity.createProfile(profileModel);
      if (success) {
        res.status(200).json({ message: `User profile for '${username}' created successfully.` });
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }
}