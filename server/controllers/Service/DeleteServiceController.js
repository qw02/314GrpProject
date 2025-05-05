import { ServiceEntity } from '../../entities/ServiceEntity.js';
import pool from '../../db.js';

/**
 * Controller for handling the soft deletion (deactivation) of a service.
 */
export class DeleteServiceController {
  /** @type {ServiceEntity} */
  serviceEntity;

  constructor() {
    this.serviceEntity = new ServiceEntity(pool);
  }

  /**
   * Handles DELETE /api/service/:id
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  deleteService = async (req, res) => {
    const serviceId = req.params.id;

    try {
      const success = await this.serviceEntity.deleteService(serviceId);
      if (success) {
        res.status(200).json({ message: `Service with id:${serviceId} deactivated successfully.` });
      } else {
        res.status(500);
      }
    } catch (error) {
      res.status(500);
    }
  }
}