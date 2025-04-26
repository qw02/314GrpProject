import { User } from '../models/User.js';

export class UserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new user account.
   * @param {User} userModel - The user account data to create.
   * @returns {Promise<boolean>} True if creation was successful, false otherwise (e.g., user already exists).
   */
  async createUser(userModel) {
    const { username, password, role } = userModel;
    // Check if user with the same username and role already exists
    const checkSql = 'SELECT 1 FROM UserAccount WHERE username = ? AND role = ?';
    const insertSql = 'INSERT INTO UserAccount (username, password, role) VALUES (?, ?, ?)';
    let connection;
    try {
      connection = await this.dbPool.getConnection();
      await connection.beginTransaction();

      const [existing] = await connection.query(checkSql, [username, role]);
      if (existing.length > 0) {
        await connection.rollback(); // User already exists
        return false;
      }

      const [result] = await connection.query(insertSql, [username, password, role]);
      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error('Database error during user account creation.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Retrieves a user account by username and role.
   * @param {string} username
   * @returns {Promise<User | null>} The user model or null if not found.
   */
  async getUserAccount(username) {
    const sql = 'SELECT username, isActive FROM UserAccount WHERE username = ?';
    try {
      const [rows] = await this.dbPool.query(sql, [username]);
      if (rows.length > 0) {
        const userData = rows[0];
        return new User(userData.username, '', userData.role, userData.isActive);
      }
      return null;
    } catch (error) {
      throw new Error('Database error while fetching user account.');
    }
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
      throw new Error('Database error during user account username search.');
    }
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
      throw new Error('Database error during user account suspension.');
    }
  }

  /**
   * Updates a user account's password.
   * @param {User} userModel - Contains username, role, and the new password.
   * @returns {Promise<boolean>} True if the update was successful, false otherwise (e.g., user not found).
   */
  async updateUserPassword(userModel) {
    const { username, password } = userModel;
    // Only update if password is provided and not empty
    if (!password) {
      return false;
    }
    const sql = 'UPDATE UserAccount SET password = ? WHERE username = ?';
    try {
      const [result] = await this.dbPool.query(sql, [password, username]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during user account update.');
    }
  }
}