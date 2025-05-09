import pool from '../../../db.js';
import { ShortlistEntity } from '../../../entities/ShortlistEntity.js';

/**
 * Controller for handling the creation of shortlist records.
 */
export class CreateShortlistController {
  /** @type {ShortlistEntity} */
  shortlistEntity;

  constructor() {
    this.shortlistEntity = new ShortlistEntity(pool);
  }

  /**
   * Handles POST /api/homeowner/shortlist
   * @param {import('express').Request} req
   * @param {import('express').Response} res
   */
  createShortlist = async (req, res) => {
    const { serviceId, homeownerUsername } = req.body;

    try {
      const result = await this.shortlistEntity.createShortlist(serviceId, homeownerUsername);
      if (result) {
        res.status(201).json({ message: 'Shortlist created successfully.' });
      } else {
        res.status(400).json({ message: 'Failed to create shortlist.' });
      }
    } catch (error) {
      console.error('Error creating shortlist:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}