import { ServiceEntity } from '../../../entities/ServiceEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of a single service by its ID.
 */
export class ReadServiceController {
  /** @type {ServiceEntity} */
  serviceEntity;

  constructor() {
    this.serviceEntity = new ServiceEntity(pool);
  }

  /**
   * Handles GET /api/service/:id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getService = async (req, res) => {
    const serviceId = req.params.id;

    try {
      const service = await this.serviceEntity.getServiceById(serviceId);
      if (service) {
        res.status(200).json(service);
      } else {
        res.status(500).json(null);
      }
    } catch (error) {
      res.status(500).json(null);
    }
  }
}