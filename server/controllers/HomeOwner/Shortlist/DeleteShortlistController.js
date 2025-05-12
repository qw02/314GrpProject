import { ShortlistEntity } from '../../../entities/ShortlistEntity.js';
import pool from '../../../db.js';

export class DeleteShortlistController {
  shortlistEntity;

  constructor() {
    this.shortlistEntity = new ShortlistEntity(pool);
  }

  deleteShortlistEntry = async (req, res) => {
    const { homeownerUsername, serviceId } = req.params;

    try {
      await this.shortlistEntity.deleteShortlistEntry(homeownerUsername, serviceId);
      res.status(200).json(true);
    } catch (error) {
      res.status(500).json(false);
    }
  };
}