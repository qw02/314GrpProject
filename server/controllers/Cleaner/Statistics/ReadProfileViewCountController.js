import { CleanerViewStatsEntity } from "../../../entities/CleanerViewStatsEntity.js";
import pool from "../../../db.js";

/**
 * Controller for handling the reading of cleaner profile view counts.
 */
export class ReadProfileViewCountController {
  /** @type {CleanerViewStatsEntity} */
  cleanerViewStatsEntity;

  constructor() {
    this.cleanerViewStatsEntity = new CleanerViewStatsEntity(pool);
  }

  /**
   * Handles GET /api/cleaner/profileStats/:username
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  getProfileViewCount = async (req, res) => {
    const cleanerUsername = req.params.username;

    try {
      const viewCount = await this.cleanerViewStatsEntity.getProfileViewCount(cleanerUsername);
      res.status(200).json(viewCount);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  };
}