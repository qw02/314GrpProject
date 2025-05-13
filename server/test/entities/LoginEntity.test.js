import { jest } from '@jest/globals';
import { LoginEntity } from '../../entities/LoginEntity.js';
import { User } from '../../models/User.js';

describe('LoginEntity', () => {
  let loginEntity;
  let mockDbPool;

  beforeEach(() => {
    mockDbPool = { query: jest.fn() };
    loginEntity = new LoginEntity(mockDbPool);
  });

  // Test Case 1: Correct details, user found and active
  it('should return a User object for valid credentials and active user', async () => {
    const userModel = new User('testUser', 'password123', 'UserAdmin');
    const mockDbResult = [{ username: 'testUser', role: 'UserAdmin', isActive: true }];

    mockDbPool.query.mockResolvedValue([mockDbResult]);

    const result = await loginEntity.verifyCredentials(userModel);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT username, role, isActive FROM UserAccount WHERE username = ? AND password = ? AND role = ? AND isActive = TRUE',
      ['testUser', 'password123', 'UserAdmin']
    );
    expect(result).toBeInstanceOf(User);
    expect(result.username).toBe('testUser');
    expect(result.role).toBe('UserAdmin');
    expect(result.isActive).toBe(true);
  });

  // Test Case 2: Valid username but invalid password
  it('should return null for valid username but invalid password', async () => {
    const userModel = new User('testUser', 'wrongPassword', 'UserAdmin');
    mockDbPool.query.mockResolvedValue([[]]);

    const result = await loginEntity.verifyCredentials(userModel);

    expect(mockDbPool.query).toHaveBeenCalledWith(
      'SELECT username, role, isActive FROM UserAccount WHERE username = ? AND password = ? AND role = ? AND isActive = TRUE',
      ['testUser', 'wrongPassword', 'UserAdmin']
    );
    expect(result).toBeNull();
  });

  it('should throw a database error when the query fails', async () => {
    const userModel = new User('errorUser', 'oops', 'PlatformManager');
    mockDbPool.query.mockRejectedValue(new Error('Connection failed'));

    await expect(loginEntity.verifyCredentials(userModel))
      .rejects
      .toThrow('Database error during login verification.');
  });
});