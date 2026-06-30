import axios from 'axios';

// The address were the backend is running
export const BASE_URL = 'https://amoud-online-registration-backend-2.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the token from storage to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── Auth Endpoints ────────────────────────────────────────────────────────────
export const loginUser = (username, password) =>
    api.post('/auth/login', { username, password });

// ─── Admin Endpoints ───────────────────────────────────────────────────────────
export const getAdminDashboard = () =>
    api.get('/admin/dashboard');

export const searchStudentById = (studentId) =>
    api.get(`/admin/search/${encodeURIComponent(studentId)}`);

export const getAllRegistrations = () =>
    api.get('/admin/registrations');

export const updateRegistration = (registrationId, data) =>
    api.put(`/admin/registrations/${registrationId}`, data);

export const deleteRegistration = (registrationId) =>
    api.delete(`/admin/registrations/${registrationId}`);

export const getAllPayments = () =>
    api.get('/admin/payments');

export const getAllUsers = () =>
    api.get('/admin/users');

export const approveUser = (userId) =>
    api.put(`/admin/users/${userId}/approve`);

/**
 * Bulk register students via Excel
 * @param {File} file Standard web File object from input
 */
export const bulkRegisterWithExcel = async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('adminToken');
    return axios.post(`${BASE_URL}/admin/bulk-register`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        },
        onUploadProgress,
    });
};

/**
 * Register a single student with full details directly from frontend form
 * @param {Object} studentData
 */
export const registerStudentFull = (studentData) => 
    api.post('/admin/register-student-full', studentData);

/**
 * Upload an Excel file mapping strictly allowed IDs to Passwords
 * @param {File} file 
 */
export const uploadCredentialsExcel = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('adminToken');
    return axios.post(`${BASE_URL}/admin/upload-credentials`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
        }
    });
};

/**
 * Fetch all allowed credentials
 */
export const getAllAllowedCredentials = () =>
    api.get('/admin/allowed-credentials');

/**
 * Add a single allowed student credential
 */
export const addSingleCredential = (studentId, password) =>
    api.post('/admin/add-single-credential', { studentId, password });

export const updateAllowedCredential = (credentialId, studentId, password) =>
    api.put(`/admin/allowed-credentials/${credentialId}`, { studentId, password });

export const deleteAllowedCredential = (credentialId) =>
    api.delete(`/admin/allowed-credentials/${credentialId}`);

export default api;
