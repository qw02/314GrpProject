import { ServiceEntity } from '../../../entities/ServiceEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the search for services based on query parameters.
 */
export class SearchServiceController {
  /** @type {ServiceEntity} */
  serviceEntity;

  constructor() {
    this.serviceEntity = new ServiceEntity(pool);
  }

  /**
   * Handles GET /api/homeowner/services/search (using query parameters for search)
   * Expected query parameters: username, categoryName, description, minPrice, maxPrice
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchServices = async (req, res) => {
    const { username, categoryName, description, minPrice, maxPrice } = req.query;

    // Prepare search parameters, converting price strings to numbers if they exist
    const searchParams = {
      username: username,
      categoryName: categoryName,
      description: description,
      minPrice: minPrice,
      maxPrice: maxPrice,
    };

    try {
      const services = await this.serviceEntity.searchServices(searchParams);
      res.status(200).json(services);
    } catch (error) {
      res.status(500).json({ message: 'An error occurred during the service search.' });
    }
  }
}