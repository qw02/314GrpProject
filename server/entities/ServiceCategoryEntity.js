import { ServiceCategory } from '../models/ServiceCategory.js';

/**
 * Manages database operations for the Service Category entity.
 * This class handles creating, reading, updating, deleting (soft delete),
 * and searching for services categories in the database.
 */
export class ServiceCategoryEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Retrieves a list of all active service categories.
   * Fetches categories marked as active in the database.
   * @returns {Promise<ServiceCategory[]>} An array of active ServiceCategory objects.
   */
  async getActiveCategories() {
    const sql = `
        SELECT id, name, description
        FROM ServiceCategory
        WHERE isActive = TRUE
        ORDER BY name ASC
    `;
    try {
      const [rows] = await this.dbPool.query(sql);
      return rows.map(row => new ServiceCategory(
        row.id,
        row.name,
        row.description
      ));
    } catch (error) {
      console.error("Database error while fetching active service categories:", error);
      throw new Error('Database error while fetching active service categories.');
    }
  }
}