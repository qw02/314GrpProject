import { ShortlistEntity } from '../../../entities/ShortlistEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the search for services within a homeowner's shortlist
 * based on various query parameters.
 */
export class SearchShortlistController {
  /** @type {ShortlistEntity} */
  shortlistEntity;

  constructor() {
    this.shortlistEntity = new ShortlistEntity(pool);
  }

  /**
   * Handles GET /api/homeowner/shortlist/search
   * Expected query parameters: homeownerUsername (required), cleanerUsername, description, minPrice, maxPrice.
   * Returns a list of service IDs.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchShortlistedServices = async (req, res) => {
    const { homeownerUsername, cleanerUsername, description, minPrice: minPriceStr, maxPrice: maxPriceStr } = req.query;

    const searchParams = {
      homeownerUsername: homeownerUsername,
      cleanerUsername: cleanerUsername ? cleanerUsername : undefined,
      description: description ? description : undefined,
      minPrice: minPriceStr ? parseFloat(minPriceStr) : undefined,
      maxPrice: maxPriceStr ? parseFloat(maxPriceStr) : undefined,
    };

    try {
      const serviceIds = await this.shortlistEntity.searchShortlistedServices(searchParams);
      res.status(200).json(serviceIds);
    } catch (error) {
      res.status(500).json(null);
    }
  }
}