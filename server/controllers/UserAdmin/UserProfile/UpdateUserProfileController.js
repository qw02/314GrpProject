import { UserProfileEntity } from '../../../entities/UserProfileEntity.js';
import { UserProfile } from '../../../models/UserProfile.js';
import pool from '../../../db.js';

/**
 * Controller for updating user profile details.
 */
export class UpdateUserProfileController {
  /** @type {UserProfileEntity} */
  userProfileEntity;

  constructor() {
    this.userProfileEntity = new UserProfileEntity(pool);
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

    // Create a model with only the fields provided in the request body
    const profileModel = new UserProfile(
      username,
      req.body.hasOwnProperty('firstName') ? firstName : undefined,
      req.body.hasOwnProperty('lastName') ? lastName : undefined,
      req.body.hasOwnProperty('email') ? email : undefined,
      req.body.hasOwnProperty('phoneNumber') ? phoneNumber : undefined
    );

    try {
      const success = await this.userProfileEntity.updateProfile(profileModel);
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