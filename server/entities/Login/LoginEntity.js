import { UserModel } from '../../models/UserModel.js';

/**
 * Handles database operations related to user login.
 * Contains the business logic for verifying user credentials against the database.
 */
export class LoginEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Verifies user credentials against the database for a specific role.
   * @param {UserModel} userModel - Contains username, password, and role to check.
   * @returns {Promise<UserModel | null>} The validated UserModel if successful, otherwise null.
   */
  async verifyCredentials(userModel) {
    const { username, password, role } = userModel;
    console.log('Verifying credentials for:', username, password, 'with role:', role);
    const sql = 'SELECT username, role, isActive FROM UserAccount WHERE username = ? AND password = ? AND role = ? AND isActive = TRUE';
    try {
      const [rows] = await this.dbPool.query(sql, [username, password, role]);
      console.log('Database query result:', rows);
      if (rows.length > 0) {
        // Credentials match and user is active
        const userData = rows[0];
        return new UserModel(userData.username, '', userData.role, userData.isActive); // Don't send password back
      }
      return null; // Credentials invalid or user inactive
    } catch (error) {
      console.error('Error verifying credentials:', error);
      throw new Error('Database error during login verification.'); // Propagate error to Controller
    }
  }
}