/**
 * Data Transfer Object for platform metrics.
 * Contains aggregated statistics for a specified period, designed to be easily
 * parsed and displayed by a React frontend.
 */
export class PlatformMetrics {
  /** @type {string} ISO string of when the report was generated. */
  generatedAt;
  /** @type {'daily' | 'weekly' | 'monthly'} The type of report period. */
  reportPeriodType;
  /** @type {string} A string identifying the specific period (e.g., a date, week range, or month-year). */
  reportPeriodIdentifier;
  /** @type {number} Total number of active user accounts. */
  activeUserAccounts;
  /** @type {number} Total number of active service categories. */
  activeServiceCategories;
  /** @type {number} Total number of active services. */
  activeServices;
  /** @type {number | null} Average price per hour of active services. Null if no active services. */
  averageServicePrice;
  /** @type {number} Percentage of active services that have been shortlisted at least once (0-100). 0 if no active services. */
  percentageServicesShortlisted;
  /** @type {number} Number of bookings made within the specified report period. */
  numberOfBookingsInPeriod;

  /**
   * Constructs a PlatformMetrics instance.
   * @param {'daily' | 'weekly' | 'monthly'} reportPeriodType The type of report.
   * @param {string} reportPeriodIdentifier Identifier for the report's time window.
   * @param {number} activeUserAccounts Count of active users.
   * @param {number} activeServiceCategories Count of active service categories.
   * @param {number} activeServices Count of active services.
   * @param {number | null} averageServicePrice Average price of active services.
   * @param {number} percentageServicesShortlisted Percentage of active services with at least one shortlist.
   * @param {number} numberOfBookingsInPeriod Count of bookings in the specified period.
   */
  constructor(
    reportPeriodType,
    reportPeriodIdentifier,
    activeUserAccounts,
    activeServiceCategories,
    activeServices,
    averageServicePrice,
    percentageServicesShortlisted,
    numberOfBookingsInPeriod
  ) {
    this.generatedAt = new Date().toISOString();
    this.reportPeriodType = reportPeriodType;
    this.reportPeriodIdentifier = reportPeriodIdentifier;
    this.activeUserAccounts = activeUserAccounts;
    this.activeServiceCategories = activeServiceCategories;
    this.activeServices = activeServices;
    this.averageServicePrice = averageServicePrice;
    this.percentageServicesShortlisted = percentageServicesShortlisted;
    this.numberOfBookingsInPeriod = numberOfBookingsInPeriod;
  }
}