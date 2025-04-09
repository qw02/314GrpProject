import { CreateUserAccountEntity } from '../../entities/UserAccount/CreateUserAccountEntity.js';
import { UserModel } from '../../models/UserModel.js';
import pool from '../../db.js';

/**
 * Controller for handling the creation of user accounts via admin requests.
 */
export class CreateUserAccountController {
  /** @type {CreateUserAccountEntity} */
  createUserAccountEntity;

  constructor() {
    this.createUserAccountEntity = new CreateUserAccountEntity(pool);
  }

  /**
   * Handles POST /api/useradmin/account
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createAccount = async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password, and role are required for account creation.' });
    }
    const validRoles = ['UserAdmin', 'Cleaner', 'HomeOwner', 'PlatformManager'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified for new account.' });
    }

    const newUserModel = new UserModel(username, password, role);

    try {
      const success = await this.createUserAccountEntity.createUser(newUserModel);
      if (success) {
        res.status(201).json({ message: `User account '${username}' (${role}) created successfully.` });
      } else {
        // Assumed reason for failure is duplicate username
        res.status(409).json({ message: `User account '${username}' with role '${role}' already exists.` });
      }
    } catch (error) {
      console.error('Create user account controller error:', error);
      res.status(500).json({ message: error.message || 'Internal server error during account creation.' });
    }
  }
}