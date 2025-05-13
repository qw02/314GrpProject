import { UserProfile } from '../models/UserProfile.js';

export class UserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new user profile. Assumes the corresponding UserAccount exists.
   * @param {UserProfile} profileModel - The profile data to insert.
   * @returns {Promise<boolean>} True if creation was successful, false otherwise (e.g., profile already exists).
   */
  async createProfile(profileModel) {
    const { username, firstName, lastName, email, phoneNumber } = profileModel;

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
        await connection.rollback();
        return false;
      }

      // Verify the UserAccount exists before creating a profile
      const accountCheckSql = 'SELECT 1 FROM UserAccount WHERE username = ?';
      const [accountExists] = await connection.query(accountCheckSql, [username]);
      if (accountExists.length === 0) {
        await connection.rollback();
        return false;
      }

      const [result] = await connection.query(insertSql, [username, firstName, lastName, email, phoneNumber]);
      await connection.commit();

      return result.affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      throw new Error('Database error during user profile creation.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Deletes a user profile from the database.
   * @param {string} username
   * @returns {Promise<boolean>} True if deletion was successful, false otherwise.
   */
  async deleteProfile(username) {
    const sql = 'DELETE FROM UserProfile WHERE username = ?';
    try {
      const [result] = await this.dbPool.query(sql, [username]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during user profile suspension.');
    }
  }

  /**
   * Retrieves a user profile by username .
   * @param {string} username
   * @returns {Promise<UserProfile | null>} The profile model or null if not found.
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
        return new UserProfile(
          profileData.username,
          profileData.firstName,
          profileData.lastName,
          profileData.email,
          profileData.phoneNumber,
        );
      }
      return null;
    } catch (error) {
      throw new Error('Database error while fetching user profile.');
    }
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
        SELECT p.username
        FROM UserProfile p
                 JOIN UserAccount a ON p.username = a.username
        WHERE (p.username LIKE ? OR p.firstName LIKE ? OR p.lastName LIKE ? OR p.email LIKE ?)
    `;
    const params = [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`];
    if (roleFilter) {
      sql += ' AND a.role = ?';
      params.push(roleFilter);
    }
    sql += ' ORDER BY p.username ASC';
    try {
      const [rows] = await this.dbPool.query(sql, params);
      return rows.map(profileData => profileData.username);
    } catch (error) {
      throw new Error('Database error during user profile username search.');
    }
  }

  /**
   * Updates a user profile.
   * @param {UserProfile} profileModel - Contains the updated profile data. Must include username.
   * @returns {Promise<boolean>} True if the update was successful, false otherwise.
   */
  async updateProfile(profileModel) {
    const { username, firstName, lastName, email, phoneNumber } = profileModel;
    // Construct the update query dynamically based on provided fields
    const fieldsToUpdate = [];
    const values = [];

    if (firstName !== undefined) { fieldsToUpdate.push('firstName = ?'); values.push(firstName); }
    if (lastName !== undefined) { fieldsToUpdate.push('lastName = ?'); values.push(lastName); }
    if (email !== undefined) { fieldsToUpdate.push('email = ?'); values.push(email); }
    if (phoneNumber !== undefined) { fieldsToUpdate.push('phoneNumber = ?'); values.push(phoneNumber); }

    if (fieldsToUpdate.length === 0) {
      return false; // No fields to update
    }

    values.push(username); // For WHERE clause

    const sql = `UPDATE UserProfile SET ${fieldsToUpdate.join(', ')} WHERE username = ?`;

    try {
      const [result] = await this.dbPool.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during user profile update.');
    }
  }
}