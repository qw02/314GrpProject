import { MetricsEntity } from '../../../entities/MetricsEntity.js';
import pool from '../../../db.js';

/**
 * Controller for handling the retrieval of monthly platform metrics.
 */
export class ReadMonthlyReportController {
  /** @type {MetricsEntity} */
  metricsEntity;

  constructor() {
    this.metricsEntity = new MetricsEntity(pool);
  }

  /**
   * Handles GET requests to retrieve monthly metrics.
   * Route: GET /api/platform/report/monthly/:year/:month
   * @param {import('express').Request} req – expects params: { year: string, month: string (1–12) }
   * @param {import('express').Response} res
   */
  getMonthlyStats = async (req, res) => {
    const { year, month } = req.params;
    try {
      const dto = await this.metricsEntity.getMonthlyStats(
        parseInt(year, 10),
        parseInt(month, 10)
      );
      res.status(200).json(dto);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
}