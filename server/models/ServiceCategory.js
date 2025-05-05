/**
 * DTO for service category data.
 */
export class ServiceCategory {
  /** @type {number} */
  id;
  /** @type {string} */
  name;
  /** @type {string | null} */
  description;

  /**
   * @param {number} id
   * @param {string} name
   * @param {string | null} description
   */
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
}