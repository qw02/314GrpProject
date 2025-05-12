import pool from '../../../db.js';
import { ShortlistEntity } from '../../../entities/ShortlistEntity.js';

/**
 * Controller for handling the creation of shortlist records.
 */
export class CreateShortlistController {
  /** @type {ShortlistEntity} */
  shortlistEntity;

  constructor() {
    this.shortlistEntity = new ShortlistEntity(pool);
  }

  /**
   * Handles POST /api/homeowner/shortlist
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createShortlist = async (req, res) => {
    const { serviceId, homeownerUsername } = req.body;

    try {
      const success = await this.shortlistEntity.createShortlist(serviceId, homeownerUsername);
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