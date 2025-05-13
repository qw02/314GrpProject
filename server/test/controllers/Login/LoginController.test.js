import { jest } from '@jest/globals';
import { User } from '../../../models/User.js';

const mockVerifyCredentials = jest.fn();

jest.unstable_mockModule('../../../entities/LoginEntity.js', () => ({
  LoginEntity: class {
    verifyCredentials = mockVerifyCredentials;
  },
}));

const { LoginController } = await import('../../../controllers/Login/LoginController.js');

describe('LoginController', () => {
  let loginController;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    loginController = new LoginController();

    mockReq = { body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockVerifyCredentials.mockReset();
  });

  it('should respond with 200 and user data on successful login', async () => {
    const fakeUser = new User('cleaner123', '', 'UserAdmin');
    mockReq.body = { username: 'cleaner123', password: 'securePassword', role: 'UserAdmin' };
    mockVerifyCredentials.mockResolvedValue(fakeUser);

    await loginController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ username: 'cleaner123', role: 'UserAdmin' });
  });

  it('should respond with 500 and null on failed login', async () => {
    mockReq.body = { username: 'wrongUser', password: 'badPass', role: 'UserAdmin' };
    mockVerifyCredentials.mockResolvedValue(null);

    await loginController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(null);
  });

  it('should call verifyCredentials with a User model containing the correct properties', async () => {
    mockReq.body = { username: 'alice', password: 'wonderland', role: 'Cleaner' };
    mockVerifyCredentials.mockResolvedValue(null);

    await loginController.login(mockReq, mockRes);

    expect(mockVerifyCredentials).toHaveBeenCalledTimes(1);

    const passedUser = mockVerifyCredentials.mock.calls[0][0];
    expect(passedUser).toBeInstanceOf(User);
    expect(passedUser.username).toBe('alice');
    expect(passedUser.password).toBe('wonderland');
    expect(passedUser.role).toBe('Cleaner');
  });

  it('should respond with 500 and null when verifyCredentials throws an error', async () => {
    mockReq.body = { username: 'bob', password: 'builder', role: 'HomeOwner' };
    mockVerifyCredentials.mockRejectedValue(new Error('DB is down'));

    await loginController.login(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(null);
  });
});