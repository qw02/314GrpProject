import { ServiceCategoryEntity } from '../../../entities/ServiceCategoryEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the creation of service categories.
 */
export class CreateServiceCategoryController {
  /** @type {ServiceCategoryEntity} */
  serviceCategoryEntity;

  constructor() {
    this.serviceCategoryEntity = new ServiceCategoryEntity(pool);
  }

  /**
   * Handles POST requests to create a new service category.
   * E.g., POST /api/platform/serviceCategory/
   * @param {import('express').Request} req - Expected body: { name: string, description: string }
   * @param {import('express').Response} res
   */
  createCategory = async (req, res) => {
    const { name, description } = req.body;

    try {
      const success = await this.serviceCategoryEntity.createServiceCategory(name, description);
      if (success) {
        res.status(200).json(true);
      } else {
        res.status(500).json(false);
      }
    } catch (error) {
      res.status(500).json(false);
    }
  }
}