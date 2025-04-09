import { UserProfileModel } from '../../models/UserProfileModel.js';

/**
 * Handles the creation of new user profiles linked to existing accounts.
 */
export class CreateUserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new user profile. Assumes the corresponding UserAccount exists.
   * @param {UserProfileModel} profileModel - The profile data to insert.
   * @returns {Promise<boolean>} True if creation was successful, false otherwise (e.g., profile already exists).
   */
  async createProfile(profileModel) {
    const { username, firstName, lastName, email, phoneNumber } = profileModel;
    // Check if a profile already exists for this user
    const checkSql = 'SELECT 1 FROM UserProfile WHERE username = ?';
    const insertSql = `
            INSERT INTO UserProfile (username, firstName, lastName, email, phoneNumber)
            VALUES (?, ?, ?, ?, ?)
        `;
    let connection;
    try {
      connection = await this.dbPool.getConnection();
      await connection.beginTransaction();

      const [existing] = await connection.query(checkSql, [username]);
      if (existing.length > 0) {
        console.warn(`Profile already exists for user ${username}.`);
        await connection.rollback();
        return false;
      }

      // Verify the UserAccount exists before creating a profile
      const accountCheckSql = 'SELECT 1 FROM UserAccount WHERE username = ?';
      const [accountExists] = await connection.query(accountCheckSql, [username]);
      if (accountExists.length === 0) {
        console.error(`Cannot create profile: UserAccount for ${username} does not exist.`);
        await connection.rollback();
        return false;
      }


      const [result] = await connection.query(insertSql, [username, firstName, lastName, email, phoneNumber]);
      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error creating user profile:', error);
      throw new Error('Database error during user profile creation.');
    } finally {
      if (connection) connection.release();
    }
  }
}