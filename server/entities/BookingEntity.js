import pool from '../db.js'

/**
 * Manages booking history for users.
 * This class handles reading and searching for booking history entries in the database,
 * interacting with Booking, Service, ServiceCategory, and UserProfile tables.
 */
export class BookingEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Retrieves detailed information for a specific booking.
   * This method is intended for ReadHistoryController.
   * @param {number} bookingId - The ID of the booking to retrieve.
   * @returns {Promise<object|null>} An object containing booking details if found, otherwise null.
   * Details include: bookingDate, cleanerName, serviceCategoryName, serviceDescription.
   */
  async getBookingDetails(bookingId) {
    const sql = `
        SELECT
            b.bookingDate,
            COALESCE(NULLIF(TRIM(CONCAT_WS(' ', up.firstName, up.lastName)), ''), s.cleanerUsername) AS cleanerName,
            sc.name AS serviceCategoryName,
            s.description AS serviceDescription
        FROM Booking b
        JOIN Service s ON b.serviceID = s.serviceID
        JOIN ServiceCategory sc ON s.categoryID = sc.id
        LEFT JOIN UserProfile up ON s.cleanerUsername = up.username
        WHERE b.bookingID = ?;
    `;
    let connection;
    try {
      connection = await this.dbPool.getConnection();
      const [rows] = await connection.query(sql, [bookingId]);
      if (rows.length > 0) {
        const result = rows[0];
        if (result.bookingDate instanceof Date) {
          result.bookingDate = result.bookingDate.toISOString().split('T')[0];
        }
        return result;
      }
      return null;
    } catch (error) {
      console.error("Database error during booking detail retrieval:", error);
      throw new Error('Database error during booking detail retrieval.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Searches for booking history entries based on various criteria.
   * This method is intended for SearchHistoryController.
   * Filters include homeowner's username, booking date range, and service category ID.
   * @param {object} searchParams - The search criteria.
   * @param {string} [searchParams.homeownerUsername] - The username of the homeowner.
   * @param {string} [searchParams.startDate] - The start date of the booking period (YYYY-MM-DD).
   * @param {string} [searchParams.endDate] - The end date of the booking period (YYYY-MM-DD).
   * @param {number} [searchParams.serviceCategoryId] - The ID of the service category.
   * @returns {Promise<Number[]>} An array of booking IDs that match the criteria.
   */
  async searchBookingHistory(searchParams) {
    const { homeownerUsername, startDate, endDate, serviceCategoryId } = searchParams;

    let sql = `
        SELECT b.bookingID
        FROM Booking b
        JOIN Service s ON b.serviceID = s.serviceID
        JOIN ServiceCategory sc ON s.categoryID = sc.id
        LEFT JOIN UserProfile up ON s.cleanerUsername = up.username
        WHERE 1=1
    `;
    const params = [];

    if (homeownerUsername) {
      sql += ' AND b.homeOwnerUsername = ?';
      params.push(homeownerUsername);
    }
    if (startDate) {
      sql += ' AND b.bookingDate >= ?';
      params.push(startDate);
    }
    if (endDate) {
      sql += ' AND b.bookingDate <= ?';
      params.push(endDate);
    }
    if (serviceCategoryId !== undefined && serviceCategoryId !== null && !isNaN(serviceCategoryId)) {
      sql += ' AND s.categoryID = ?';
      params.push(serviceCategoryId);
    }

    sql += ' ORDER BY b.bookingDate DESC, b.bookingID DESC';

    let connection;
    try {
      connection = await this.dbPool.getConnection();
      const [rows] = await connection.query(sql, params);
      return rows.map(row => row.bookingID);
    } catch (error) {
      console.error("Database error during booking history search:", error);
      throw new Error('Database error during booking history search.');
    } finally {
      if (connection) connection.release();
    }
  }
}