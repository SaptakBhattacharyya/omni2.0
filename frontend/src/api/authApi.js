/**
 * authApi.js
 *
 * This file handles all "who are you?" requests to the backend.
 * Any time a user needs to log in, sign up, or fetch their own profile,
 * we call one of the functions below.
 *
 * All functions use apiClient (our smart messenger) so we don't have
 * to repeat headers, error handling, etc.
 */

import apiClient from './apiClient';


/**
 * login
 *
 * Sends the user's email + password to the server.
 * If correct, the server responds with an access token that we can
 * use for all future requests.
 *
 * @param {Object} credentials - Example: { email: 'a@b.com', password: '123' }
 * @returns The server's response (usually contains accessToken + user info)
 */
export const login = async (credentials) => {
  return apiClient.post('/users/login', credentials);
};


/**
 * register
 *
 * Creates a brand new user account on the server.
 *
 * @param {Object} userData - Example: { name: 'Alice', email: 'a@b.com', password: '123' }
 * @returns The server's response (usually contains the new user's info)
 */
export const register = async (userData) => {
  return apiClient.post('/users/register', userData);
};


/**
 * getProfile
 *
 * Fetches the currently logged-in user's profile from the server.
 * The server knows who "the current user" is because apiClient
 * automatically attaches the Bearer token in the Authorization header.
 *
 * @returns The logged-in user's profile data
 */
export const getProfile = async () => {
  return apiClient.get('/users/profile');
};


/**
 * generateApiKey
 *
 * Requests a brand new API key for a retailer.
 *
 * @returns {Promise<Object>} Contains the raw { apiKey }
 */
export const generateApiKey = async () => {
  return apiClient.post('/users/api-key', {});
};


/**
 * updateProfile
 *
 * Updates the current user's profile information.
 *
 * @param {Object} userData - Example: { name: 'Alice', email: 'a@b@com' }
 * @returns The updated user profile
 */
export const updateProfile = async (userData) => {
  return apiClient.put('/users/profile', userData);
};


/**
 * clerkSync
 *
 * Sends the Clerk authenticated user information to the backend to
 * find or create the MongoDB user and retrieve our app's JWT token.
 *
 * @param {Object} userData - Example: { clerkId, email, name, avatar, role, retailerCategory }
 * @returns The user data + token from MongoDB backend
 */
export const clerkSync = async (userData) => {
  return apiClient.post('/users/clerk-sync', userData);
};


// Bundle all the functions together so you can also do:
//   import authApi from './authApi';
//   authApi.login(...)
const authApi = {
  login,
  register,
  getProfile,
  generateApiKey,
  updateProfile,
  clerkSync,
};

export default authApi;

