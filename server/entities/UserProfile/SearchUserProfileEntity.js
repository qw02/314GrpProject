/**
 * Handles searching for user profiles based on criteria and returns matching usernames.
 */
export class SearchUserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Searches for user profiles based on a query string (e.g., part of name, email, username)
   * and returns an array of unique matching usernames.
   * @param {string} searchTerm - The string to search for.
   * @param {'UserAdmin' | 'Cleaner' | 'HomeOwner' | 'PlatformManager' | undefined} roleFilter - Optional role to filter by.
   * @returns {Promise<string[]>} A list of unique matching usernames.
   */
  async searchProfiles(searchTerm, roleFilter) {
    let sql = `
            SELECT username
            FROM UserProfile
            WHERE (username LIKE ? OR firstName LIKE ? OR lastName LIKE ? OR email LIKE ?)
        `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];

    if (roleFilter) {
      sql += ' AND role = ?';
      params.push(roleFilter);
    }
    sql += ' ORDER BY username ASC';

    try {
      const [rows] = await this.dbPool.query(sql, params);
      // Map the result rows to an array of username strings
      return rows.map(profileData => profileData.username);
    } catch (error) {
      console.error('Error searching user profiles (usernames only):', error);
      throw new Error('Database error during user profile username search.');
    }
  }
}