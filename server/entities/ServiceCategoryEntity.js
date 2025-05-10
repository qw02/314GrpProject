import { ServiceCategory } from '../models/ServiceCategory.js';

/**
 * Provides data access methods for interacting with the ServiceCategory table in the database.
 * It handles operations such as creating, retrieving, updating, soft-deleting,
 * and searching service categories.
 */
export class ServiceCategoryEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new service category.
   * @param {string} name - The name of the service category.
   * @param {string} description - The description of the service category.
   * @returns {Promise<boolean>} True if creation was successful, false otherwise.
   */
  async createServiceCategory(name, description) {
    const sql = 'INSERT INTO ServiceCategory (name, description) VALUES (?, ?)';
    try {
      const [result] = await this.dbPool.query(sql, [name, description]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during service category creation.');
    }
  }

  /**
   * Retrieves an active service category by its ID.
   * @param {number} id - The ID of the service category to retrieve.
   * @returns {Promise<ServiceCategory | null>} The service category DTO if found, otherwise null.
   */
  async getServiceCategory(id) {
    const sql = 'SELECT id, name, description, isActive FROM ServiceCategory WHERE id = ? AND isActive = TRUE';
    try {
      const [rows] = await this.dbPool.query(sql, [id]);
      if (rows.length > 0) {
        const row = rows[0];
        return new ServiceCategory(row.id, row.name, row.description);
      }
      return null;
    } catch (error) {
      throw new Error('Database error while fetching service category.');
    }
  }

  /**
   * Updates the name and/or description of an existing service category.
   * Changes are only applied for fields that are provided (not undefined).
   * This method can update a category regardless of its isActive status.
   * @param {number} id - The ID of the service category to update.
   * @param {string | undefined} name - The new name (if updating).
   * @param {string | undefined} description - The new description (if updating).
   * @returns {Promise<boolean>} True if the update was successful (affected at least one row), false otherwise.
   */
  async updateServiceCategory(id, name, description) {
    const fieldsToUpdate = [];
    const values = [];

    if (name !== undefined) {
      fieldsToUpdate.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fieldsToUpdate.push('description = ?');
      values.push(description);
    }

    if (fieldsToUpdate.length === 0) {
      return false;
    }

    values.push(id); // For the WHERE clause
    const sql = `UPDATE ServiceCategory
                 SET ${fieldsToUpdate.join(', ')}
                 WHERE id = ?`;

    try {
      const [result] = await this.dbPool.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during service category update.');
    }
  }

  /**
   * Soft-deletes a service category by setting its isActive flag to FALSE.
   * @param {number} id - The ID of the service category to deactivate.
   * @returns {Promise<boolean>} True if deactivation was successful, false otherwise (e.g., category not found).
   */
  async deleteServiceCategory(id) {
    const sql = 'UPDATE ServiceCategory SET isActive = FALSE WHERE id = ? AND isActive = TRUE';
    try {
      const [result] = await this.dbPool.query(sql, [id]);
      return result.affectedRows > 0;
    } catch (error) {
      // console.error('Database error during service category deactivation:', error);
      throw new Error('Database error during service category deactivation.');
    }
  }

  async searchServiceCategories(searchTerm) {
    let sql;
    let params = [];

    if (searchTerm) {
      sql = `
          SELECT id, name, description
          FROM ServiceCategory
          WHERE (name LIKE ? OR description LIKE ?)
            AND isActive = TRUE
          ORDER BY name ASC
      `;
      const queryParam = `%${searchTerm}%`;
      params = [queryParam, queryParam];
    } else {
      sql = `
          SELECT id, name, description
          FROM ServiceCategory
          WHERE isActive = TRUE
          ORDER BY name ASC
      `;
      // No params needed
    }

    try {
      const [rows] = await this.dbPool.query(sql, params);
      return rows.map(row => new ServiceCategory(row.id, row.name, undefined));
    } catch (error) {
      throw new Error('Database error during service category search.');
    }
  }
}