import { UserAccountEntity } from "../../../entities/UserAccountEntity.js";
import pool from '../../../db.js';

/**
 * Controller for reading user account details.
 */
export class ReadUserAccountController {
  /** @type {UserAccountEntity} */
  createUserAccountEntity;

  constructor() {
    this.userAccountEntity = new UserAccountEntity(pool);
  }

  /**
   * Handles GET /api/useradmin/account/:username
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getAccount = async (req, res) => {
    const { username } = req.params;

    try {
      const userAccount = await this.userAccountEntity.getUserAccount(username);
      if (userAccount) {
        // Exclude password before sending response
        const { password, ...accountData } = userAccount;
        res.status(200).json(accountData);
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }
}