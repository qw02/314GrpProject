import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

// ================================================================================
// --- Import Controllers ---
// ================================================================================
// Shared login for all roles
import { LoginController } from './controllers/Login/LoginController.js';

// User Account Controllers
import { CreateUserAccountController } from './controllers/UserAccount/CreateUserAccountController.js';
import { ReadUserAccountController } from './controllers/UserAccount/ReadUserAccountController.js';
import { UpdateUserAccountController } from './controllers/UserAccount/UpdateUserAccountController.js';
import { SuspendUserAccountController } from './controllers/UserAccount/SuspendUserAccountController.js';
import { SearchUserAccountController } from './controllers/UserAccount/SearchUserAccountController.js';

// User Profile Controllers
import { CreateUserProfileController } from './controllers/UserProfile/CreateUserProfileController.js';
import { ReadUserProfileController } from './controllers/UserProfile/ReadUserProfileController.js';
import { UpdateUserProfileController } from './controllers/UserProfile/UpdateUserProfileController.js';
import { DeleteUserProfileController } from './controllers/UserProfile/DeleteUserProfileController.js';
import { SearchUserProfileController } from './controllers/UserProfile/SearchUserProfileController.js';


// ================================================================================
// --- Application Setup ---
// ================================================================================
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ================================================================================
// --- Instantiate Controllers ---
// ================================================================================
// Shared login for all roles
const loginController = new LoginController();

// User Account Controllers
const createUserAccountController = new CreateUserAccountController();
const readUserAccountController = new ReadUserAccountController();
const updateUserAccountController = new UpdateUserAccountController();
const suspendUserAccountController = new SuspendUserAccountController();
const searchUserAccountController = new SearchUserAccountController();

// User Profile Controllers
const createUserProfileController = new CreateUserProfileController();
const readUserProfileController = new ReadUserProfileController();
const updateUserProfileController = new UpdateUserProfileController();
const deleteUserProfileController = new DeleteUserProfileController();
const searchUserProfileController = new SearchUserProfileController();

// ================================================================================
// --- Routes ---
// ================================================================================
// Authentication (Shared)
app.post('/api/login', loginController.login);

// User Admin - Account Management API
app.post('/api/useradmin/account', createUserAccountController.createAccount);
app.get('/api/useradmin/account/:username/', readUserAccountController.getAccount);
app.put('/api/useradmin/account/:username/', updateUserAccountController.updateAccount);
app.put('/api/useradmin/account/:username/suspend', suspendUserAccountController.suspendAccount);
app.get('/api/useradmin/accounts/search', searchUserAccountController.searchAccounts);

// User Admin - Profile Management API
app.post('/api/useradmin/profile', createUserProfileController.createProfile);
app.get('/api/useradmin/profile/:username/', readUserProfileController.getProfile);
app.put('/api/useradmin/profile/:username/', updateUserProfileController.updateProfile);
app.delete('/api/useradmin/profile/:username/', deleteUserProfileController.deleteProfile);
app.get('/api/useradmin/profiles/search', searchUserProfileController.searchProfiles);


// Basic root route
app.get('/', (req, res) => {
  res.send('Cleaner Platform Backend is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});