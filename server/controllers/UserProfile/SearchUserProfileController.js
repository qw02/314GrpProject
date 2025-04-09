import { SearchUserProfileEntity } from '../../entities/UserProfile/SearchUserProfileEntity.js';
import pool from '../../db.js';

/**
 * Controller for searching user profiles, returning only usernames.
 */
export class SearchUserProfileController {
  /** @type {SearchUserProfileEntity} */
  searchUserProfileEntity;

  constructor() {
    this.searchUserProfileEntity = new SearchUserProfileEntity(pool);
  }

  /**
   * Returns an array of matching usernames.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchProfiles = async (req, res) => {
    const searchTerm = req.query.q || '';
    const roleFilter = req.query.role;

    if (roleFilter) {
      const validRoles = ['UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager'];
      if (!validRoles.includes(roleFilter)) {
        return res.status(400).json({ message: 'Invalid role specified for search filter.' });
      }
    }

    try {
      const usernames = await this.searchUserProfileEntity.searchProfiles(searchTerm, roleFilter);
      res.status(200).json(usernames);
    } catch (error) {
      console.error('Search user profiles controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during profile search.' });
    }
  }
}