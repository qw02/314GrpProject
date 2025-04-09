import { SuspendUserAccountEntity } from '../../entities/UserAccount/SuspendUserAccountEntity.js';
import pool from '../../db.js';

/**
 * Controller for suspending or reactivating user accounts.
 */
export class SuspendUserAccountController {
  /** @type {SuspendUserAccountEntity} */
  suspendUserAccountEntity;

  constructor() {
    this.suspendUserAccountEntity = new SuspendUserAccountEntity(pool);
  }

  /**
   * Handles PUT /api/useradmin/account/:username/suspend
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  suspendAccount = async (req, res) => {
    const { username } = req.params;

    if (!username ) {
      return res.status(400).json({ message: 'Username is required in the URL path.' });
    }

    try {
      const success = await this.suspendUserAccountEntity.suspendUser(username);
      if (success) {
        res.status(200).json({ message: `User account '${username}' suspended successfully.` });
      } else {
        res.status(404).json({ message: `User account '${username}' not found.` });
      }
    } catch (error) {
      console.error('Suspend user account controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during account suspension.' });
    }
  }
}