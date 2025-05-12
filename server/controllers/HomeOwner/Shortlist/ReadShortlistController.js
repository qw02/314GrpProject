import { ShortlistEntity } from '../../../entities/ShortlistEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of a single shortlist entry status
 * (i.e., whether a specific service is shortlisted by a specific homeowner).
 */
export class ReadShortlistController {
  /** @type {ShortlistEntity} */
  shortlistEntity;

  constructor() {
    this.shortlistEntity = new ShortlistEntity(pool);
  }

  /**
   * Handles GET /api/homeowner/shortlist/entry/:homeOwnerUsername/:serviceId
   * Checks if a specific service is in a specific homeowner's shortlist.
   * Responds with a boolean indicating existence.
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  checkShortlistEntry = async (req, res) => {
    const { homeOwnerUsername, serviceId: serviceId } = req.params;

    try {
      const exists = await this.shortlistEntity.getShortlistEntry(homeOwnerUsername, serviceId);
      res.status(200).json(exists);
    } catch (error) {
      res.status(500).json(false);
    }
  }
}