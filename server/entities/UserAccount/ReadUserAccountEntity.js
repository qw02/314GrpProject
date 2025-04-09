import pool from '../../db.js';
import { UserModel } from '../../models/UserModel.js';

/**
 * Handles reading user account details from the database.
 */
export class ReadUserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Retrieves a user account by username and role.
   * @param {string} username
   * @returns {Promise<UserModel | null>} The user model or null if not found.
   */
  async getUserAccount(username) {
    const sql = 'SELECT username, isActive FROM UserAccount WHERE username = ?';
    try {
      const [rows] = await this.dbPool.query(sql, [username]);
      if (rows.length > 0) {
        const userData = rows[0];
        // Note: We don't fetch/return the password
        return new UserModel(userData.username, '', userData.role, userData.isActive);
      }
      return null;
    } catch (error) {
      console.error('Error reading user account:', error);
      throw new Error('Database error while fetching user account.');
    }
  }
}