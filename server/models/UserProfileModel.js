/**
 * Represents user profile data transferred between layers.
 */
export class UserProfileModel {
   /** @type {string} */
  username;
  /** @type {string} */
  firstName;
  /** @type {string} */
  lastName;
  /** @type {string} */
  email;
  /** @type {string} */
  phoneNumber;

  /**
   * @param {string} username
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} phoneNumber
   */
  constructor(username, firstName = null, lastName = null, email = null, phoneNumber = null) {
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phoneNumber = phoneNumber;
  }
}