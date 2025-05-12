import { MetricsEntity } from '../../../entities/MetricsEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of weekly platform metrics.
 */
export class ReadWeeklyReportController {
  /** @type {MetricsEntity} */
  metricsEntity;

  constructor() {
    this.metricsEntity = new MetricsEntity(pool);
  }

  /**
   * Handles GET requests to retrieve weekly metrics.
   * Route: GET /api/platform/report/weekly/:monday
   * @param {import('express').Request} req – expects params: { monday: string (YYYY-MM-DD, must be a Monday) }
   * @param {import('express').Response} res
   */
  getWeeklyStats = async (req, res) => {
    const { monday } = req.params;

    try {
      const dto = await this.metricsEntity.getWeeklyStats(monday);
      res.status(200).json(dto);
    } catch (error) {
      res.status(500).json(null);
    }
  };
}