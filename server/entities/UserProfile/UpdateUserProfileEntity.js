import { UserProfileModel } from '../../models/UserProfileModel.js';

/**
 * Handles updating existing user profile details in the database.
 */
export class UpdateUserProfileEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Updates a user profile.
   * @param {UserProfileModel} profileModel - Contains the updated profile data. Must include username.
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
      console.warn(`No fields provided to update for profile ${username} (${role}).`);
      return false; // No fields to update
    }

    values.push(username); // For WHERE clause

    const sql = `UPDATE UserProfile SET ${fieldsToUpdate.join(', ')} WHERE username = ?`;

    try {
      const [result] = await this.dbPool.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Database error during user profile update.');
    }
  }
}