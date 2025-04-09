/**
 * Handles suspending (soft deleting) user accounts in the database.
 */
export class SuspendUserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Sets the isActive flag to false for a given user account.
   * @param {string} username
   * @returns {Promise<boolean>} True if suspension was successful, false otherwise.
   */
  async suspendUser(username) {
    const sql = 'UPDATE UserAccount SET isActive = FALSE WHERE username = ? ';
    try {
      const [result] = await this.dbPool.query(sql, [username]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error suspending user account:', error);
      throw new Error('Database error during user account suspension.');
    }
  }
}