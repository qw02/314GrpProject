import { PlatformMetrics } from '../models/PlatformMetrics.js';

/**
 * Manages the retrieval of platform metrics and statistics.
 * This class queries the database to generate daily, weekly, and monthly reports
 * summarizing platform activity and key performance indicators.
 */
export class MetricsEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Retrieves global platform statistics that are not tied to a specific date range.
   * This includes counts of active users, categories, services, average service price,
   * and the percentage of services that have been shortlisted.
   * @private
   * @param {import('mysql2/promise').PoolConnection} connection A database connection.
   * @returns {Promise<object>} An object containing global platform statistics.
   */
  async _getGlobalPlatformStats(connection) {
    const [userCountRows] = await connection.query(
      "SELECT COUNT(*) AS count FROM UserAccount WHERE isActive = TRUE;"
    );
    const activeUserAccounts = userCountRows[0].count;

    const [categoryCountRows] = await connection.query(
      "SELECT COUNT(*) AS count FROM ServiceCategory WHERE isActive = TRUE;"
    );
    const activeServiceCategories = categoryCountRows[0].count;

    const [serviceStatsRows] = await connection.query(`
        SELECT COUNT(*)          AS totalActiveServices,
               AVG(pricePerHour) AS averagePrice
        FROM Service
        WHERE isActive = TRUE;
    `);
    const activeServices = serviceStatsRows[0].totalActiveServices;
    const averageServicePrice = activeServices > 0 ? parseFloat(serviceStatsRows[0].averagePrice) : null;

    let percentageServicesShortlisted = 0;
    if (activeServices > 0) {
      const [shortlistedServiceRows] = await connection.query(`
          SELECT COUNT(DISTINCT s.serviceID) AS countShortlistedActiveServices
          FROM Service s
                   JOIN Shortlist sl ON s.serviceID = sl.serviceID
          WHERE s.isActive = TRUE;
      `);
      const countShortlistedActiveServices = shortlistedServiceRows[0].countShortlistedActiveServices;
      percentageServicesShortlisted = (countShortlistedActiveServices / activeServices) * 100;
    }

    return {
      activeUserAccounts,
      activeServiceCategories,
      activeServices,
      averageServicePrice,
      percentageServicesShortlisted: parseFloat(percentageServicesShortlisted.toFixed(2)) // Rounded to 2 decimal places
    };
  }

  /**
   * Retrieves the number of bookings within a given date range.
   * @private
   * @param {import('mysql2/promise').PoolConnection} connection A database connection.
   * @param {string} startDate The start date of the range (YYYY-MM-DD).
   * @param {string} endDate The end date of the range (YYYY-MM-DD).
   * @returns {Promise<number>} The number of bookings.
   */
  async _getBookingsInDateRange(connection, startDate, endDate) {
    const sql = "SELECT COUNT(*) AS count FROM Booking WHERE bookingDate >= ? AND bookingDate <= ?;";
    const [bookingRows] = await connection.query(sql, [startDate, endDate]);
    return bookingRows[0].count;
  }

  /**
   * Generates daily statistics for a given date.
   * @param {string} dateString The date for the report (YYYY-MM-DD).
   * @returns {Promise<PlatformMetrics>} The daily statistics.
   * @throws {Error} If the date format is invalid or a database error occurs.
   */
  async getDailyStats(dateString) {
    let connection;
    try {
      const reportDate = new Date(dateString);
      if (isNaN(reportDate.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        throw new Error("Invalid date format for daily stats. Please use YYYY-MM-DD.");
      }
      const formattedDate = reportDate.toISOString().split('T')[0];

      connection = await this.dbPool.getConnection();
      const globalStats = await this._getGlobalPlatformStats(connection);
      const numberOfBookingsInPeriod = await this._getBookingsInDateRange(connection, formattedDate, formattedDate);

      return new PlatformMetrics(
        'daily',
        formattedDate,
        globalStats.activeUserAccounts,
        globalStats.activeServiceCategories,
        globalStats.activeServices,
        globalStats.averageServicePrice,
        globalStats.percentageServicesShortlisted,
        numberOfBookingsInPeriod
      );
    } catch (error) {
      throw new Error('Error generating daily statistics.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Generates weekly statistics for a week starting on the given Monday.
   * The report covers from the specified Monday to the following Sunday.
   * @param {string} mondayDateString The date of the Monday starting the week (YYYY-MM-DD).
   * @returns {Promise<PlatformMetrics>} The weekly statistics.
   * @throws {Error} If the date is not a Monday, format is invalid, or a database error occurs.
   */
  async getWeeklyStats(mondayDateString) {
    let connection;
    try {
      const monday = new Date(mondayDateString);

      const startDate = new Date(monday); // Clone
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const reportIdentifier = `${formattedStartDate} to ${formattedEndDate}`;

      connection = await this.dbPool.getConnection();
      const globalStats = await this._getGlobalPlatformStats(connection);
      const numberOfBookingsInPeriod = await this._getBookingsInDateRange(connection, formattedStartDate, formattedEndDate);

      return new PlatformMetrics(
        'weekly',
        reportIdentifier,
        globalStats.activeUserAccounts,
        globalStats.activeServiceCategories,
        globalStats.activeServices,
        globalStats.averageServicePrice,
        globalStats.percentageServicesShortlisted,
        numberOfBookingsInPeriod
      );
    } catch (error) {
      throw new Error('Error generating weekly statistics.');
    } finally {
      if (connection) connection.release();
    }
  }

  /**
   * Generates monthly statistics for a given year and month.
   * @param {number} year The year of the report.
   * @param {number} month The month of the report (1-12).
   * @returns {Promise<PlatformMetrics>} The monthly statistics.
   * @throws {Error} If the month is invalid or a database error occurs.
   */
  async getMonthlyStats(year, month) {
    let connection;
    try {

      // First day of the month
      const startDate = new Date(Date.UTC(year, month - 1, 1));
      // Last day of the month
      const endDate = new Date(Date.UTC(year, month, 0));

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      const reportIdentifier = `${year}-${String(month).padStart(2, '0')}`;

      connection = await this.dbPool.getConnection();
      const globalStats = await this._getGlobalPlatformStats(connection);
      const numberOfBookingsInPeriod = await this._getBookingsInDateRange(connection, formattedStartDate, formattedEndDate);

      return new PlatformMetrics(
        'monthly',
        reportIdentifier,
        globalStats.activeUserAccounts,
        globalStats.activeServiceCategories,
        globalStats.activeServices,
        globalStats.averageServicePrice,
        globalStats.percentageServicesShortlisted,
        numberOfBookingsInPeriod
      );
    } catch (error) {
      throw new Error('Error generating monthly statistics.');
    } finally {
      if (connection) connection.release();
    }
  }
}