import { Service } from '../../models/Service.js';
import { ServiceEntity } from '../../entities/ServiceEntity.js';
import pool from '../../db.js';

/**
 * Controller for handling the creation of service bookings.
 */
export class CreateServiceController {
  /** @type {ServiceEntity} */
  serviceEntity;

  constructor() {
    this.serviceEntity = new ServiceEntity(pool);
  }

  /**
   * Handles POST /api/service
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createService = async (req, res) => {

    const { cleanerUsername, categoryId, description, pricePerHour } = req.body;

    const service = new Service(undefined, cleanerUsername, categoryId, description, pricePerHour);

    try {
      const id = await this.serviceEntity.createService(service);
      if (id) {
        res.status(201).json({ message: `Service with id:${id} created successfully.` });
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }

  /**
   * Handles GET /api/service/categories
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getCategories = async (req, res) => {
    try {
      const categories = await this.serviceEntity.getActiveCategories();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500);
    }
  }
}