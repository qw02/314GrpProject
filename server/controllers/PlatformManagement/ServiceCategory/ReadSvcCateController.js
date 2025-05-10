import { ServiceCategoryEntity } from '../../../entities/ServiceCategoryEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of a single service category by its ID.
 */
export class ReadServiceCategoryController {
  /** @type {ServiceCategoryEntity} */
  serviceCategoryEntity;

  constructor() {
    this.serviceCategoryEntity = new ServiceCategoryEntity(pool);
  }

  /**
   * Handles GET requests to retrieve a service category by ID.
   * E.g., GET /api/platform/serviceCategory/:id
   * @param {import('express').Request} req - Expected params: { id: string }
   * @param {import('express').Response} res
   */
  getCategoryById = async (req, res) => {
    const categoryId = req.params.id;

    try {
      const category = await this.serviceCategoryEntity.getServiceCategory(categoryId);
      if (category) {
        res.status(200).json(category);
      } else {
        res.status(500).json({ message: 'Internal server error.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}