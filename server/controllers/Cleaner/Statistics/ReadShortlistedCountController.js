import { CleanerViewStatsEntity } from "../../../entities/CleanerViewStatsEntity.js";
import pool from "../../../db.js";

/**
 * Controller for handling the reading of cleaner service shortlist counts.
 */

export class ReadShortlistedCountController {
  /** @type {CleanerViewStatsEntity} */
  cleanerViewStatsEntity;

  constructor() {
    this.cleanerViewStatsEntity = new CleanerViewStatsEntity(pool);
  }

  /**
   * Handles GET /api/cleaner/serviceStats/:username
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getServiceShortlistStats = async (req, res) => {
    const cleanerUsername = req.params.username;

    try {
      const serviceShortlistStats = await this.cleanerViewStatsEntity.getServiceShortlistStats(cleanerUsername);
      res.status(200).json(serviceShortlistStats);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}