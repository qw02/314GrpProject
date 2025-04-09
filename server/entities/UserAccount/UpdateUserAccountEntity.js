import { UserModel } from '../../models/UserModel.js';

/**
 * Handles updating existing user account details in the database.
 */
export class UpdateUserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Updates a user account's password.
   * @param {UserModel} userModel - Contains username, role, and the new password.
   * @returns {Promise<boolean>} True if the update was successful, false otherwise (e.g., user not found).
   */
  async updateUserPassword(userModel) {
    const { username, password } = userModel;
    // Only update if password is provided and not empty
    if (!password) {
      console.warn(`Attempted to update user ${username} without providing a password.`);
      return false;
    }
    const sql = 'UPDATE UserAccount SET password = ? WHERE username = ?';
    try {
      const [result] = await this.dbPool.query(sql, [password, username]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user account password:', error);
      throw new Error('Database error during user account update.');
    }
  }
}
