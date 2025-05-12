import { BookingEntity } from '../../../entities/BookingEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the search for booking history entries
 * based on various query parameters.
 */
export class SearchHistoryController {
  /** @type {BookingEntity} */
  bookingEntity;

  constructor() {
    this.bookingEntity = new BookingEntity(pool);
  }

  /**
   * Handles GET /api/homeowner/bookings/search
   * Expected query parameters: homeownerUsername, startDate, endDate, serviceCategoryId (all optional).
   * Returns a list of booking history summary objects.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchBookings = async (req, res) => {
    const { homeownerUsername, startDate, endDate, serviceCategoryId } = req.query;


    const searchParams = {
      homeownerUsername: homeownerUsername ? String(homeownerUsername) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      serviceCategoryId: serviceCategoryId ? String(serviceCategoryId) : undefined,
    };

    try {
      const bookingHistoriesIds = await this.bookingEntity.searchBookingHistory(searchParams);
      res.status(200).json(bookingHistoriesIds);
    } catch (error) {
      res.status(500).json(null);
    }
  }
}