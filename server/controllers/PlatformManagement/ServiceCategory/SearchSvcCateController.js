import { ServiceCategoryEntity } from '../../../entities/ServiceCategoryEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the search of service categories.
 */
export class SearchSvcCateController {
  /** @type {ServiceCategoryEntity} */
  serviceCategoryEntity;

  constructor() {
    this.serviceCategoryEntity = new ServiceCategoryEntity(pool);
  }

  /**
   * Handles GET /api/serviceCategory/search
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  searchCategories = async (req, res) => {
    try {
      const categories = await this.serviceCategoryEntity.getActiveCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500);
    }
  }
}