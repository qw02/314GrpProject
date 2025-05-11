import { UserAccountEntity } from "../../../entities/UserAccountEntity.js";
import { User } from '../../../models/User.js';
import pool from '../../../db.js';

/**
 * Controller for updating user account details (e.g., password).
 */
export class UpdateUserAccountController {
  /** @type {UserAccountEntity} */
  userAccountEntity;

  constructor() {
    this.userAccountEntity = new UserAccountEntity(pool);
  }

  /**
   * Handles PUT /api/useradmin/account/:username/
   * Expects { password: "newPassword" } in the body.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateAccount = async (req, res) => {
    const { username } = req.params;
    const { password } = req.body; // Only expecting password update

    const userModel = new User(username, password);

    try {
      const success = await this.userAccountEntity.updateUserPassword(userModel);
      if (success) {
        res.status(200).json(true);
      } else {
        res.status(500).json(false);
      }
    } catch
      (error) {
      res.status(500).json(false);
    }
  }
}