import { Service } from '../../../models/Service.js';
import { ServiceEntity } from '../../../entities/ServiceEntity.js';
import pool from '../../../db.js';

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
      const success = await this.serviceEntity.createService(service);
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