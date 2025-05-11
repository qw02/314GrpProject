import { Service } from '../models/Service.js';

/**
 * Manages database operations for the Service entity.
 * This class handles creating, reading, updating, deleting (soft delete),
 * and searching for services in the database, interacting directly with the Service table.
 */
export class ServiceEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Creates a new service entry in the database.
   * @param {Service} serviceModel - The service data transfer object containing details for the new service.
   * @returns {Promise<boolean>} True if the service was created successfully, false otherwise.
   */
  async createService(serviceModel) {
    const { cleanerUsername, categoryId, description, pricePerHour } = serviceModel;
    const sql = `
        INSERT INTO Service (cleanerUsername, categoryID, description, pricePerHour, isActive)
        VALUES (?, ?, ?, ?, TRUE)
    `;
    let connection;
    try {
      connection = await this.dbPool.getConnection();
      const [result] = await connection.query(sql, [cleanerUsername, categoryId, description, pricePerHour]);
      return result.insertId > 0;
    } catch (error) {
      throw new Error('Database error during service creation.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Retrieves a single active service by its unique ID.
   * Returns the full details of the service if found and active.
   * @param {number} serviceId - The ID of the service to retrieve.
   * @returns {Promise<Service | null>} A Service object if found and active, otherwise null.
   */
  async getServiceById(serviceId) {
    const sql = `
        SELECT serviceID, cleanerUsername, categoryID, description, pricePerHour
        FROM Service
        WHERE serviceID = ?
          AND isActive = TRUE
    `;
    try {
      const [rows] = await this.dbPool.query(sql, [serviceId]);
      if (rows.length > 0) {
        const row = rows[0];
        return new Service(
          row.serviceID,
          row.cleanerUsername,
          row.categoryID,
          row.description,
          parseFloat(row.pricePerHour)
        );
      }
      return null;
    } catch (error) {
      throw new Error('Database error while fetching service by ID.');
    }
  }

  /**
   * Searches for active services based on various criteria.
   * Allows filtering by username, category name, description content, and price range.
   * Returns a list of services with descriptions truncated.
   * @param {object} searchParams - The search criteria.
   * @param {string} [searchParams.username] - Partial match for cleaner's username.
   * @param {string} [searchParams.categoryName] - Partial match for the service category name.
   * @param {string} [searchParams.description] - Partial match for the service description.
   * @param {number} [searchParams.minPrice] - Minimum price per hour.
   * @param {number} [searchParams.maxPrice] - Maximum price per hour.
   * @param {number} [descriptionLength=100] - The maximum length for the returned description snippet.
   * @returns {Promise<Service[]>} An array of matching Service objects with truncated descriptions.
   */
  async searchServices(searchParams = {}, descriptionLength = 100) {
    const { username, categoryName, description, minPrice, maxPrice } = searchParams;
    let sql = `
        SELECT s.serviceID,
               s.cleanerUsername,
               s.categoryID,
               LEFT(s.description, ?) AS description,
               s.pricePerHour
        FROM Service s
                 JOIN ServiceCategory sc ON s.categoryID = sc.id
        WHERE s.isActive = TRUE
    `;
    const params = [descriptionLength]; // Start params with description length

    if (username) {
      sql += ' AND s.cleanerUsername LIKE ?';
      params.push(`%${username}%`);
    }
    if (categoryName) {
      sql += ' AND sc.name LIKE ?';
      params.push(`%${categoryName}%`);
    }
    if (description) {
      sql += ' AND s.description LIKE ?';
      params.push(`%${description}%`);
    }

    if (minPrice !== undefined && minPrice !== null) {
      sql += ' AND s.pricePerHour >= ?';
      params.push(minPrice);
    }
    if (maxPrice !== undefined && maxPrice !== null) {
      sql += ' AND s.pricePerHour <= ?';
      params.push(maxPrice);
    }

    sql += ' ORDER BY s.serviceID ASC';

    try {
      const [rows] = await this.dbPool.query(sql, params);
      return rows.map(row => new Service(
        row.serviceID,
        row.cleanerUsername,
        row.categoryID,
        row.description,
        parseFloat(row.pricePerHour)
      ));
    } catch (error) {
      throw new Error('Database error during service search.');
    }
  }

  /**
   * Updates the description and/or pricePerHour for an existing, active service.
   * Only modifies the fields that are actually provided (not undefined).
   * If neither field is provided, returns false without making changes.
   * @param {Service} serviceModel - The service data containing the serviceId and any updated fields.
   * @returns {Promise<boolean>} True if the update was successful, false otherwise.
   */
  async updateService(serviceModel) {
    const { serviceId, description, pricePerHour } = serviceModel;

    // serviceId is required
    if (serviceId === undefined || serviceId === null) {
      return false;
    }

    // Build dynamic SET clause
    const setClauses = [];
    const params = [];

    if (description !== undefined) {
      setClauses.push('description = ?');
      params.push(description);
    }
    if (pricePerHour !== undefined) {
      setClauses.push('pricePerHour = ?');
      params.push(pricePerHour);
    }

    if (setClauses.length === 0) {
      // Nothing to update
      return false;
    }

    const sql = `
        UPDATE Service
        SET ${setClauses.join(', ')}
        WHERE serviceID = ?
          AND isActive = TRUE
    `;
    params.push(serviceId);

    try {
      const [result] = await this.dbPool.query(sql, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during service update.');
    }
  }

  /**
   * Performs a soft delete on a service by setting its isActive flag to false.
   * The service will no longer appear in searches or direct retrievals via getServiceById.
   * @param {number} serviceId - The ID of the service to deactivate.
   * @returns {Promise<boolean>} True if the deactivation was successful, false otherwise.
   */
  async deleteService(serviceId) {
    const sql = 'UPDATE Service SET isActive = FALSE WHERE serviceID = ?';
    try {
      const [result] = await this.dbPool.query(sql, [serviceId]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error('Database error during service deactivation.');
    }
  }
}