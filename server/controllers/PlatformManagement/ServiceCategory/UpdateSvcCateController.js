import { ServiceCategoryEntity } from '../../../entities/ServiceCategoryEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling updates to existing service categories.
 */
export class UpdateServiceCategoryController {
  /** @type {ServiceCategoryEntity} */
  serviceCategoryEntity;

  constructor() {
    this.serviceCategoryEntity = new ServiceCategoryEntity(pool);
  }

  /**
   * Handles PUT requests to update a service category.
   * E.g., PUT /api/platform/serviceCategory/:id
   * @param {import('express').Request} req - Expected params: { id: string }, body: { name?: string, description?: string }
   * @param {import('express').Response} res
   */
  updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const { name, description } = req.body;

    try {
      const success = await this.serviceCategoryEntity.updateServiceCategory(categoryId, name, description);
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