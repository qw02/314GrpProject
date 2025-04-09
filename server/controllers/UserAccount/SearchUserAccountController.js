import { SearchUserAccountEntity } from '../../entities/UserAccount/SearchUserAccountEntity.js';
import pool from '../../db.js';

/**
 * Controller for searching user accounts, returning only usernames.
 */
export class SearchUserAccountController {
  /** @type {SearchUserAccountEntity} */
  searchUserAccountEntity;

  constructor() {
    this.searchUserAccountEntity = new SearchUserAccountEntity(pool);
  }

  /**
   * Returns an array of matching usernames.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchAccounts = async (req, res) => {
    const searchTerm = req.query.q || '';
    const roleFilter = req.query.role;

    if (roleFilter) {
      const validRoles = ['UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager'];
      if (!validRoles.includes(roleFilter)) {
        return res.status(400).json({ message: 'Invalid role specified for search filter.' });
      }
    }

    try {
      const usernames = await this.searchUserAccountEntity.searchUsers(searchTerm, roleFilter);
      res.status(200).json(usernames);
    } catch (error) {
      console.error('Search user accounts controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during account search.' });
    }
  }
}