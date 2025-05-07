import { Booking } from '../models/Booking.js';

export class CleanerBookingEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  /**
   * @param {import('mysql2/promise').Pool} dbPool
   */
  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Searches for a cleaner’s past confirmed bookings.
   * Returns an array of Booking DTOs containing basic info.
   * @param {string} cleanerUsername
   * @param {object} [searchCriteria]
   * @param {string} [searchCriteria.bookingDateStart] - YYYY-MM-DD
   * @param {string} [searchCriteria.bookingDateEnd]   - YYYY-MM-DD
   * @param {number} [searchCriteria.categoryID]
   * @returns {Promise<Booking[]>}
   */
  async searchConfirmedMatches(cleanerUsername, searchCriteria = {}) {
    const { bookingDateStart, bookingDateEnd, categoryID } = searchCriteria;

    let sql = `
      SELECT
        b.bookingID,
        b.homeOwnerUsername,
        DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDate,
        sc.name AS serviceCategoryName
      FROM Booking b
      JOIN Service s ON b.serviceID = s.serviceID
      JOIN ServiceCategory sc ON s.categoryID = sc.id
      WHERE s.cleanerUsername = ?
    `;
    const params = [cleanerUsername];

    if (bookingDateStart) {
      sql += ` AND b.bookingDate >= ?`;
      params.push(bookingDateStart);
    }
    if (bookingDateEnd) {
      sql += ` AND b.bookingDate <= ?`;
      params.push(bookingDateEnd);
    }
    if (categoryID != null) {
      sql += ` AND s.categoryID = ?`;
      params.push(categoryID);
    }

    sql += ` ORDER BY b.bookingDate DESC, b.bookingID DESC;`;

    try {
      const [rows] = await this.dbPool.query(sql, params);
      return rows.map(row =>
        new Booking(
          row.bookingID,
          row.homeOwnerUsername,
          row.bookingDate,
          row.serviceCategoryName
        )
      );
    } catch (error) {
      console.error('Database error during searchConfirmedMatches:', error);
      throw new Error('Database error during booking search.');
    }
  }

  /**
   * Retrieves full details of a single confirmed booking.
   * Returns a Booking DTO including service description, or null if not found/unauthorized.
   * @param {number} bookingId
   * @returns {Promise<Booking|null>}
   */
  async getConfirmedMatchDetails(bookingId) {
    const sql = `
      SELECT
        b.bookingID,
        b.homeOwnerUsername,
        DATE_FORMAT(b.bookingDate, '%Y-%m-%d') AS bookingDate,
        sc.name AS serviceCategoryName,
        s.description AS serviceDescription
      FROM Booking b
      JOIN Service s ON b.serviceID = s.serviceID
      JOIN ServiceCategory sc ON s.categoryID = sc.id
      WHERE b.bookingID = ?
    `;
    const params = [bookingId];

    try {
      const [rows] = await this.dbPool.query(sql, params);
      if (rows.length === 0) return null;

      const row = rows[0];
      return new Booking(
        row.bookingID,
        row.homeOwnerUsername,
        row.bookingDate,
        row.serviceCategoryName,
        row.serviceDescription
      );
    } catch (error) {
      console.error('Database error during getConfirmedMatchDetails:', error);
      throw new Error('Database error during booking details retrieval.');
    }
  }
}