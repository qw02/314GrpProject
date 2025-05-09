import { BookingEntity } from '../../../entities/BookingEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of a specific booking's details.
 */
export class ReadHistoryController {
  /** @type {BookingEntity} */
  bookingEntity;

  constructor() {
    this.bookingEntity = new BookingEntity(pool);
  }

  /**
   * Handles GET /api/homeowner/booking/:bookingId
   * Retrieves and returns the details of a specific booking.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getBookingDetailsById = async (req, res) => {
    const { bookingId } = req.params;

    try {
      const bookingDetails = await this.bookingEntity.getBookingDetails(bookingId);

      if (bookingDetails) {
        res.status(200).json(bookingDetails);
      } else {
        res.status(404).json({ message: 'Booking not found.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}