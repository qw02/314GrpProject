import { UserAccountEntity } from "../../../entities/UserAccountEntity.js";
import pool from '../../../db.js';

/**
 * Controller for suspending or reactivating user accounts.
 */
export class SuspendUserAccountController {
  /** @type {UserAccountEntity} */
  userAccountEntity;

  constructor() {
    this.userAccountEntity = new UserAccountEntity(pool);
  }

  /**
   * Handles PUT /api/useradmin/account/:username/suspend
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  suspendAccount = async (req, res) => {
    const { username } = req.params;

    try {
      const success = await this.userAccountEntity.suspendUser(username);
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