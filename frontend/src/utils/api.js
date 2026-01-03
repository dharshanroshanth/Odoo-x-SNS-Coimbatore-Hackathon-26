import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Auth APIs
export const register = async (userData) => {
  const response = await axios.post(`${API}/auth/register`, userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axios.post(`${API}/auth/login`, credentials);
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API}/auth/me`, { headers: getAuthHeader() });
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(`${API}/auth/profile`, data, { headers: getAuthHeader() });
  return response.data;
};

// Trip APIs
export const createTrip = async (tripData) => {
  const response = await axios.post(`${API}/trips`, tripData, { headers: getAuthHeader() });
  return response.data;
};

export const getTrips = async () => {
  const response = await axios.get(`${API}/trips`, { headers: getAuthHeader() });
  return response.data;
};

export const getTrip = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}`, { headers: getAuthHeader() });
  return response.data;
};

export const updateTrip = async (tripId, data) => {
  const response = await axios.put(`${API}/trips/${tripId}`, data, { headers: getAuthHeader() });
  return response.data;
};

export const deleteTrip = async (tripId) => {
  const response = await axios.delete(`${API}/trips/${tripId}`, { headers: getAuthHeader() });
  return response.data;
};

export const publishTrip = async (tripId) => {
  const response = await axios.post(`${API}/trips/${tripId}/publish`, {}, { headers: getAuthHeader() });
  return response.data;
};

export const getPublicTrip = async (publicUrl) => {
  const response = await axios.get(`${API}/public/trips/${publicUrl}`);
  return response.data;
};

// Stop APIs
export const createStop = async (stopData) => {
  const response = await axios.post(`${API}/stops`, stopData, { headers: getAuthHeader() });
  return response.data;
};

export const getStops = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}/stops`, { headers: getAuthHeader() });
  return response.data;
};

export const deleteStop = async (stopId) => {
  const response = await axios.delete(`${API}/stops/${stopId}`, { headers: getAuthHeader() });
  return response.data;
};

// City APIs
export const searchCities = async (search = '', country = '') => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (country) params.append('country', country);
  const response = await axios.get(`${API}/cities?${params.toString()}`);
  return response.data;
};

export const getCity = async (cityId) => {
  const response = await axios.get(`${API}/cities/${cityId}`);
  return response.data;
};

// Activity APIs
export const getCityActivities = async (cityId, category = null, maxCost = null) => {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (maxCost) params.append('max_cost', maxCost);
  const response = await axios.get(`${API}/cities/${cityId}/activities?${params.toString()}`);
  return response.data;
};

export const addTripActivity = async (activityData) => {
  const response = await axios.post(`${API}/trip-activities`, activityData, { headers: getAuthHeader() });
  return response.data;
};

export const getTripActivities = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}/activities`, { headers: getAuthHeader() });
  return response.data;
};

export const deleteTripActivity = async (activityId) => {
  const response = await axios.delete(`${API}/trip-activities/${activityId}`, { headers: getAuthHeader() });
  return response.data;
};

// Expense APIs
export const createExpense = async (expenseData) => {
  const response = await axios.post(`${API}/expenses`, expenseData, { headers: getAuthHeader() });
  return response.data;
};

export const getTripExpenses = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}/expenses`, { headers: getAuthHeader() });
  return response.data;
};

export const getTripBudget = async (tripId) => {
  const response = await axios.get(`${API}/trips/${tripId}/budget`, { headers: getAuthHeader() });
  return response.data;
};

// Community APIs
export const createPost = async (postData) => {
  const response = await axios.post(`${API}/posts`, postData, { headers: getAuthHeader() });
  return response.data;
};

export const getPosts = async (limit = 50) => {
  const response = await axios.get(`${API}/posts?limit=${limit}`);
  return response.data;
};

export const likePost = async (postId) => {
  const response = await axios.post(`${API}/posts/${postId}/like`, {}, { headers: getAuthHeader() });
  return response.data;
};

// Admin APIs
export const getAdminStats = async () => {
  const response = await axios.get(`${API}/admin/stats`, { headers: getAuthHeader() });
  return response.data;
};
