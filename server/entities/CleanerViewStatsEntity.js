export class CleanerViewStatsEntity {
  /** @type {import('mysql2/promise').Pool} */
  dbPool;

  constructor(dbPool) {
    this.dbPool = dbPool;
  }

  /**
   * Gets the number of times the given cleaner's profile has been viewed.
   * @param {string} cleanerUsername - The username of the cleaner.
   * @returns {Promise<number>} - The view count (0 if not present).
   */
  async getProfileViewCount(cleanerUsername) {
    const [rows] = await this.dbPool.query(
      'SELECT viewCount FROM CleanerProfileView WHERE username = ?',
      [cleanerUsername]
    );
    if (rows.length === 0) {
      return 0;
    }
    return rows[0].viewCount;
  }

  /**
   * Gets the number of times each service by this cleaner has been shortlisted.
   * Returns all services, including those with zero shortlists.
   * @param {string} cleanerUsername - The username of the cleaner.
   * @returns {Promise<Array<{serviceID: number, description: string, shortlistCount: number}>>}
   */
  async getServiceShortlistStats(cleanerUsername) {
    const sql = `
        SELECT COUNT(*) AS totalShortlists
        FROM Shortlist s
                 JOIN Service serv ON s.serviceID = serv.serviceID
        WHERE serv.cleanerUsername = ?
    `;
    try {
      const [rows] = await this.dbPool.query(sql, [cleanerUsername]);
      return rows[0].totalShortlists;
    } catch (error) {
      throw error;
    }
  }
}