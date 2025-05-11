import { CleanerBookingEntity } from '../../../entities/CleanerBookingEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the search of a cleaner’s booking history.
 */
export class SearchBookingHistoryController {
  /** @type {CleanerBookingEntity} */
  bookingEntity;

  constructor() {
    this.bookingEntity = new CleanerBookingEntity(pool);
  }

  /**
   * Handles GET /api/bookings/search
   * Expected query parameters: cleanerUsername, bookingDateStart, bookingDateEnd, categoryID
   * @param {import('express').Request}  req
   * @param {import('express').Response} res
   */
  searchBookingHistory = async (req, res) => {
    const { cleanerUsername, bookingDateStart, bookingDateEnd, categoryID } = req.query;
    const searchParams = { bookingDateStart, bookingDateEnd, categoryID };

    try {
      const bookings = await this.bookingEntity.searchConfirmedMatches(
        cleanerUsername,
        searchParams
      );
      res.status(200).json(bookings);
    } catch (error) {
      res.status(500).json(null);
    }
  }
}