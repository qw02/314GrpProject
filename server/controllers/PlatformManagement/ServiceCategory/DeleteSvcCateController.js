import { ServiceCategoryEntity } from '../../../entities/ServiceCategoryEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the soft-deletion (deactivation) of service categories.
 */
export class DeleteServiceCategoryController {
  /** @type {ServiceCategoryEntity} */
  serviceCategoryEntity;

  constructor() {
    this.serviceCategoryEntity = new ServiceCategoryEntity(pool);
  }

  /**
   * Handles DELETE requests to soft-delete (deactivate) a service category.
   * E.g., DELETE /api/platform/serviceCategory/:id
   * @param {import('express').Request} req - Expected params: { id: string }
   * @param {import('express').Response} res
   */
  deleteCategory = async (req, res) => {
    const categoryId = req.params.id;


    try {
      const success = await this.serviceCategoryEntity.deleteServiceCategory(categoryId);
      if (success) {
        res.status(200).json({ message: `Service category deactivated successfully.` });
      } else {
        res.status(500).json({ message: 'Internal server error.' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
}