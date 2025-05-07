/**
 * DTO for booking data transferred between layers.
 */
export class Booking {
  /** @type {number} */
  bookingId;
  /** @type {string} */
  homeOwnerUsername;
  /** @type {string} */
  bookingDate;
  /** @type {string} */
  serviceCategoryName;
  /** @type {string | undefined} */
  serviceDescription;

  /**
   * @param {number} bookingId - Unique identifier of the booking.
   * @param {string} homeOwnerUsername - Username of the home owner.
   * @param {string} bookingDate - Date of the booking (YYYY-MM-DD).
   * @param {string} serviceCategoryName - Name of the service category.
   * @param {string} [serviceDescription] - Description of the service (detailed view).
   */
  constructor(
    bookingId,
    homeOwnerUsername,
    bookingDate,
    serviceCategoryName,
    serviceDescription
  ) {
    this.bookingId = bookingId;
    this.homeOwnerUsername = homeOwnerUsername;
    this.bookingDate = bookingDate;
    this.serviceCategoryName = serviceCategoryName;
    this.serviceDescription = serviceDescription;
  }
}