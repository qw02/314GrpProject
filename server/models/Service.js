/**
 * DTO for service data transferred between layers.
 */
export class Service {
  /** @type {number} */
  serviceId;
  /** @type {string} */
  cleanerUsername;
  /** @type {number} */
  categoryId;
  /** @type {string} */
  description;
  /** @type {number} */
  pricePerHour;
  /**
   * @param {number | undefined} serviceId
   * @param {string} cleanerUsername
   * @param {number} categoryId
   * @param {string} description
   * @param {number} pricePerHour
   */
  constructor(serviceId, cleanerUsername, categoryId, description, pricePerHour) {
    this.serviceId = serviceId;
    this.cleanerUsername = cleanerUsername;
    this.categoryId = categoryId;
    this.description = description;
    this.pricePerHour = pricePerHour;
  }
}