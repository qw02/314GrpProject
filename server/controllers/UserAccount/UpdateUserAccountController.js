import { UpdateUserAccountEntity } from '../../entities/UserAccount/UpdateUserAccountEntity.js';
import { UserModel } from '../../models/UserModel.js';
import pool from '../../db.js';
/**
 * Controller for updating user account details (e.g., password).
 */
export class UpdateUserAccountController {
  /** @type {UpdateUserAccountEntity} */
  updateUserAccountEntity;

  constructor() {
    this.updateUserAccountEntity = new UpdateUserAccountEntity(pool);
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

    if (!username) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }
    if (!password) {
      return res.status(400).json({ message: 'New password is required in the request body.' });
    }

    const userModel = new UserModel(username, password);

    try {
      const success = await this.updateUserAccountEntity.updateUserPassword(userModel);
      if (success) {
        res.status(200).json({ message: `Password for user '${username}' updated successfully.` });
      } else {
        res.status(400).json({ message: `User account '${username}' not found or no update occurred.` });
      }
    } catch (error) {
      console.error('Update user account controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during account update.' });
    }
  }
}