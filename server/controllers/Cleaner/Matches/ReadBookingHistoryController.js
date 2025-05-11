import { CleanerBookingEntity } from '../../../entities/CleanerBookingEntity.js';
import pool from '../../../db.js';

/**
 * Controller for retrieving detailed information about a single booking.
 */
export class ReadBookingHistoryController {
  /** @type {CleanerBookingEntity} */
  bookingEntity;

  constructor() {
    this.bookingEntity = new CleanerBookingEntity(pool);
  }

  /**
   * Handles GET /api/cleaner/bookingHistory/booking/:bookingId
   * Expected path parameter: bookingId
   * @param {import('express').Request}  req
   * @param {import('express').Response} res
   */
  readBookingHistory = async (req, res) => {
    const { bookingId } = req.params;

    try {
      const booking = await this.bookingEntity.getConfirmedMatchDetails(bookingId);
      if (booking) {
        res.status(200).json(booking);
      } else {
        res.status(500).json(null);
      }
    } catch (error) {
      res.status(500).json(null);
    }
  };
}