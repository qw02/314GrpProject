/**
 * Handles searching for user accounts based on criteria and returns matching usernames.
 */
export class SearchUserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Searches for user accounts based on a query string (e.g., part of username)
   * and returns an array of unique matching usernames.
   * @param {string} searchTerm - The string to search for in usernames.
   * @param {'Admin' | 'Cleaner' | 'HomeOwner' | 'PlatformManager' | undefined} roleFilter - Optional role to filter by.
   * @returns {Promise<string[]>} A list of unique matching usernames.
   */
  async searchUsers(searchTerm, roleFilter) {
    let sql = 'SELECT username FROM UserAccount WHERE username LIKE ?';
    const params = [`%${searchTerm}%`];

    if (roleFilter) {
      sql += ' AND role = ?';
      params.push(roleFilter);
    }
    sql += ' ORDER BY username ASC';

    try {
      const [rows] = await this.dbPool.query(sql, params);
      // Map the result rows to an array of username strings
      return rows.map(userData => userData.username);
    } catch (error) {
      console.error('Error searching user accounts (usernames only):', error);
      throw new Error('Database error during user account username search.');
    }
  }
}