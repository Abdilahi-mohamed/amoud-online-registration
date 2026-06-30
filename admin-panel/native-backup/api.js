import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Base URL ──────────────────────────────────────────────────────────────────
// Match the main backend server used by the web frontend.
// Update this if your backend runs on a different machine or network address.
export const BASE_URL = 'http://172.20.10.2:5000/api';

// ─── Axios Instance ────────────────────────────────────────────────────────────
const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the token from storage to every request
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth Endpoints ────────────────────────────────────────────────────────────

/**
 * Login an existing user
 * @param {string} username
 * @param {string} password
 */
export const loginUser = (username, password) =>
    api.post('/auth/login', { username, password });

// ─── Admin Endpoints ───────────────────────────────────────────────────────────

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = () =>
    api.get('/admin/dashboard');

/**
 * Search student by ID
 * @param {string} studentId
 */
export const searchStudentById = (studentId) =>
    api.get(`/admin/search/${encodeURIComponent(studentId)}`);

/**
 * Create registration for student
 * @param {string} userId
 * @param {number} semester
 * @param {string} department
 * @param {string} classId
 */
export const createRegistration = (userId, semester, department, classId) =>
    api.post('/admin/registrations', { userId, semester, department, classId });

/**
 * Get all registrations
 */
export const getAllRegistrations = () =>
    api.get('/admin/registrations');

/**
 * Get all payments
 */
export const getAllPayments = () =>
    api.get('/admin/payments');

/**
 * Bulk register students via Excel
 * @param {Object} fileObj Contains uri, name, and type properties
 */
export const bulkRegisterWithExcel = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', {
        uri: fileObj.uri,
        name: fileObj.name || 'students.xlsx',
        type: fileObj.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const token = await AsyncStorage.getItem('userToken');
    return axios.post(`${BASE_URL}/admin/bulk-register`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    });
};

export default api;