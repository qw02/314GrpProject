import { Service } from '../../../models/Service.js';
import { ServiceEntity } from '../../../entities/ServiceEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the update of an existing service.
 */
export class UpdateServiceController {
  /** @type {ServiceEntity} */
  serviceEntity;

  constructor() {
    this.serviceEntity = new ServiceEntity(pool);
  }

  /**
   * Handles PUT /api/service/:id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  updateService = async (req, res) => {
    const serviceId = req.params.id;
    const { description, pricePerHour } = req.body;

    // Construct a partial Service model for the update
    const serviceUpdateData = new Service(serviceId, undefined, undefined, description, pricePerHour);

    try {
      const success = await this.serviceEntity.updateService(serviceUpdateData);
      if (success) {
        res.status(200).json({ message: `Service with id:${serviceId} updated successfully.` });
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }
}