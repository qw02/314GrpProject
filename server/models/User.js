/**
 * Represents the core user account data transferred between layers.
 */
export class User {
  /** @type {string} */
  username;
  /** @type {string | undefined} */
  password;
  /** @type {'UserAdmin' | 'Cleaner' | 'HomeOwner' | 'PlatformManager'} */
  role;
  /** @type {boolean | undefined} */
  isActive;

  /**
   * @param {string} username
   * @param {string | undefined} password
   * @param {'UserAdmin' | 'Cleaner' | 'HomeOwner' | 'PlatformManager'} role
   * @param {boolean | undefined} isActive
   */
  constructor(username, password, role = null, isActive = undefined) {
    this.username = username;
    this.password = password;
    this.role = role;
    this.isActive = isActive;
  }
}