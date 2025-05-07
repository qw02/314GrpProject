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
import { CreateUserAccountController } from './controllers/UserAdmin/UserAccount/CreateUserAccountController.js';
import { ReadUserAccountController } from './controllers/UserAdmin/UserAccount/ReadUserAccountController.js';
import { UpdateUserAccountController } from './controllers/UserAdmin/UserAccount/UpdateUserAccountController.js';
import { SuspendUserAccountController } from './controllers/UserAdmin/UserAccount/SuspendUserAccountController.js';
import { SearchUserAccountController } from './controllers/UserAdmin/UserAccount/SearchUserAccountController.js';

// User Profile Controllers
import { CreateUserProfileController } from './controllers/UserAdmin/UserProfile/CreateUserProfileController.js';
import { ReadUserProfileController } from './controllers/UserAdmin/UserProfile/ReadUserProfileController.js';
import { UpdateUserProfileController } from './controllers/UserAdmin/UserProfile/UpdateUserProfileController.js';
import { DeleteUserProfileController } from './controllers/UserAdmin/UserProfile/DeleteUserProfileController.js';
import { SearchUserProfileController } from './controllers/UserAdmin/UserProfile/SearchUserProfileController.js';

// Service Controllers
import { CreateServiceController } from './controllers/Cleaner/Service/CreateServiceController.js';
import { ReadServiceController } from './controllers/Cleaner/Service/ReadServiceController.js';
import { UpdateServiceController } from './controllers/Cleaner/Service/UpdateServiceController.js';
import { DeleteServiceController } from './controllers/Cleaner/Service/DeleteServiceController.js';
import { SearchServiceController } from './controllers/Cleaner/Service/SearchServiceController.js';

// Cleaner Statistics Controllers
import { ReadProfileViewCountController } from './controllers/Cleaner/Statistics/ReadProfileViewCountController.js';
import { ReadShortlistedCountController } from './controllers/Cleaner/Statistics/ReadShortlistedCountController.js';

// Cleaner Booking History Controllers
import { ReadBookingHistoryController } from './controllers/Cleaner/Matches/ReadBookingHistoryController.js';
import { SearchBookingHistoryController } from "./controllers/Cleaner/Matches/SearchBookingHistoryController.js";

// Service Category Controllers
import { SearchSvcCateController } from "./controllers/PlatformManagement/ServiceCategory/SearchSvcCateController.js";


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

// Service Controllers
const createServiceController = new CreateServiceController();
const readServiceController = new ReadServiceController();
const updateServiceController = new UpdateServiceController();
const deleteServiceController = new DeleteServiceController();
const searchServiceController = new SearchServiceController();

// Cleaner Statistics Controllers
const readProfileViewCountController = new ReadProfileViewCountController();
const readShortlistedCountController = new ReadShortlistedCountController();

// Cleaner Booking History Controllers
const readBookingHistoryController = new ReadBookingHistoryController();
const searchBookingHistoryController = new SearchBookingHistoryController();

// Service Category Controllers
const searchServiceCategoryController = new SearchSvcCateController();

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

// Cleaner - Service API
app.post('/api/cleaner/service', createServiceController.createService);
app.get('/api/cleaner/service/search', searchServiceController.searchServices);
app.get('/api/cleaner/service/:id', readServiceController.getService);
app.put('/api/cleaner/service/:id', updateServiceController.updateService);
app.delete('/api/cleaner/service/:id', deleteServiceController.deleteService);

// Cleaner - Statistics API
app.get('/api/cleaner/profileView/:username', readProfileViewCountController.getProfileViewCount);
app.get('/api/cleaner/serviceStats/:username', readShortlistedCountController.getServiceShortlistStats);

// Cleaner - Booking History API
app.get('/api/cleaner/bookingHistory/search', searchBookingHistoryController.searchBookingHistory);
app.get('/api/cleaner/bookingHistory/booking/:bookingId', readBookingHistoryController.readBookingHistory);

// Platform Management - Service Category API
app.get('/api/platform/serviceCategory/search', searchServiceCategoryController.searchCategories);

// Basic root route
app.get('/', (req, res) => {
  res.send('Cleaner Platform Backend is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});