import { UserProfileEntity } from '../../../entities/UserProfileEntity.js';
import pool from '../../../db.js';

/**
 * Controller for searching user profiles, returning only usernames.
 */
export class SearchUserProfileController {
  /** @type {UserProfileEntity} */
  userProfileEntity;

  constructor() {
    this.userProfileEntity = new UserProfileEntity(pool);
  }

  /**
   * Returns an array of matching usernames.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchProfiles = async (req, res) => {
    const searchTerm = req.query.q || '';
    const roleFilter = req.query.role;

    try {
      const usernames = await this.userProfileEntity.searchProfiles(searchTerm, roleFilter);
      res.status(200).json(usernames);
    } catch (error) {
      res.status(500).json(null);
    }
  }
}