import { MetricsEntity } from '../../../entities/MetricsEntity.js';
import pool from '../../../db.js';

export class ReadDailyReportController {
  /** @type {MetricsEntity} */
  metricsEntity;

  constructor() {
    this.metricsEntity = new MetricsEntity(pool);
  }

  /**
   * Handles GET requests to retrieve daily metrics.
   * Route: GET /api/platform/report/daily/:date
   * @param {import('express').Request} req – expects params: { date: string (YYYY-MM-DD) }
   * @param {import('express').Response} res
   */
  getDailyStats = async (req, res) => {
    const { date } = req.params;
    try {
      const dto = await this.metricsEntity.getDailyStats(date);
      res.status(200).json(dto);
    } catch (error) {
      res.status(500).json(null);
    }
  };
}