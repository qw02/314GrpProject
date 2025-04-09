import { UserProfileModel } from '../../models/UserProfileModel.js';

/**
 * Handles reading user profile details from the database.
 */
export class ReadUserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Retrieves a user profile by username .
   * @param {string} username
   * @returns {Promise<UserProfileModel | null>} The profile model or null if not found.
   */
  async getUserProfile(username) {
    const sql = `
            SELECT username, firstName, lastName, email, phoneNumber
            FROM UserProfile
            WHERE username = ?
        `;
    try {
      const [rows] = await this.dbPool.query(sql, [username]);
      if (rows.length > 0) {
        const profileData = rows[0];
        return new UserProfileModel(
          profileData.username,
          profileData.firstName,
          profileData.lastName,
          profileData.email,
          profileData.phoneNumber,
        );
      }
      return null;
    } catch (error) {
      console.error('Error reading user profile:', error);
      throw new Error('Database error while fetching user profile.');
    }
  }
}