import { UserAccountEntity } from "../../../entities/UserAccountEntity.js";
import pool from '../../../db.js';

/**
 * Controller for searching user accounts, returning only usernames.
 */
export class SearchUserAccountController {
  /** @type {UserAccountEntity} */
  userAccountEntity;

  constructor() {
    this.userAccountEntity = new UserAccountEntity(pool);
  }

  /**
   * Returns an array of matching usernames.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchAccounts = async (req, res) => {
    const searchTerm = req.query.q || '';
    const roleFilter = req.query.role;

    try {
      const usernames = await this.userAccountEntity.searchUsers(searchTerm, roleFilter);
      res.status(200).json(usernames);
    } catch (error) {
      res.status(500).json(null);
    }
  }
}