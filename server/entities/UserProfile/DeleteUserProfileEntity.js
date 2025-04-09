/**
 * Handles deleting user profiles.
 */
export class DeleteUserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Deletes a user profile from the database.
   * @param {string} username
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise.
   */
  async suspendProfile(username) {
    const sql = 'DELETE FROM UserProfile WHERE username = ?';
    try {
      const [result] = await this.dbPool.query(sql, [username]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting user profile:', error);
      throw new Error('Database error during user profile suspension.');
    }
  }
}