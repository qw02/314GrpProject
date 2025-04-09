import { ReadUserAccountEntity } from '../../entities/UserAccount/ReadUserAccountEntity.js';
import pool from '../../db.js';

/**
 * Controller for reading user account details.
 */
export class ReadUserAccountController {
  /** @type {ReadUserAccountEntity} */
  readUserAccountEntity;

  constructor() {
    this.readUserAccountEntity = new ReadUserAccountEntity(pool);
  }

  /**
   * Handles GET /api/useradmin/account/:username
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getAccount = async (req, res) => {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }

    try {
      const userAccount = await this.readUserAccountEntity.getUserAccount(username);
      if (userAccount) {
        // Exclude password before sending response
        const { password, ...accountData } = userAccount;
        res.status(200).json(accountData);
      } else {
        res.status(404).json({ message: `User account '${username}' not found.` });
      }
    } catch (error) {
      console.error('Read user account controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error while fetching account.' });
    }
  }
}