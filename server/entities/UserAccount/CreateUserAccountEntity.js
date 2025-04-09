import { UserModel } from '../../models/UserModel.js';

/**
 * Handles the creation of new user accounts in the database.
 * Contains business logic like checking for existing users before insertion.
 */
export class CreateUserAccountEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new user account.
   * @param {UserModel} userModel - The user account data to create.
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
      console.error('Error creating user account:', error);
      throw new Error('Database error during user account creation.');
    } finally {
      if (connection) connection.release();
    }
  }
}