import axios from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Base URL ──────────────────────────────────────────────────────────────────
// For Expo desktop/web and iOS simulator, use localhost.
// For Android emulator, use 10.0.2.2.
// For physical devices, set YOUR_PHYSICAL_DEVICE_IP below.
const CUSTOM_HOST = ''; // e.g. '192.168.1.120'
const LOCAL_HOST = CUSTOM_HOST || (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
export const BASE_URL = `http://172.20.10.2
:5000/api`;

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

/**
 * Validate secondary login using ID and Password from Excel
 * @param {string} id
 * @param {string} password
 */
export const secondaryLogin = (id, password) =>
    api.post('/secondary-auth/validate', { id, password });

/**
 * Get the currently logged-in user's profile
 */
export const getMe = () =>
    api.get('/auth/me');

// ─── Registration Endpoints ────────────────────────────────────────────────────

/**
 * Get all classes for a given semester
 * @param {number} semester - 1 or 2
 */
export const getClasses = (semester) =>
    api.get(`/registration/classes?semester=${semester}`);

/**
 * Register a student for a fresh/first-year class
 * @param {string} classId
 * @param {number} semester - 1 or 2
 */
export const freshRegister = (classId, semester) =>
    api.post('/registration/fresh', { classId, semester });

/**
 * Register a student for a semester by department
 * @param {string} department
 * @param {number} semester - 1 or 2
 */
export const semesterRegister = (department, year, semester, className, studentId, studentName, faculty) =>
    api.post('/registration/semester', { department, year, semester, className, studentId, studentName, faculty });

export const getRegisteredStudents = (department, year, semester, className) =>
    api.get(`/registration/students?department=${encodeURIComponent(department)}&year=${encodeURIComponent(year)}&semester=${semester}&className=${encodeURIComponent(className)}`);

export const getFaculties = () =>
    api.get('/faculties');

/**
 * Create a fee payment record
 * @param {string} studentId
 * @param {string} studentName
 * @param {string} paymentNumber
 * @param {number} amount
 */
export const createPayment = (studentId, studentName, paymentNumber, amount) =>
    api.post('/payments', { studentId, studentName, paymentNumber, amount });

export const initializeSifaloPayment = (data) =>
    api.post('/payment/initialize', data);

export const verifySifaloPayment = (transactionId) =>
    api.get(`/payment/verify/${transactionId}`);

/**
 * Get payments for logged in user or all if admin
 */
export const getPayments = () =>
    api.get('/payments');

/**
 * Get payment history for a specific student by ID
 */
export const getPaymentsForStudent = (studentId) =>
    api.get(`/payments/student/${studentId}`);

export const submitFeedback = (subject, message) =>
    api.post('/feedback', { subject, message });

// ─── Admin Endpoints ────────────────────────────────────────────────────────
export const getAdminDashboard = () => api.get('/admin/dashboard');
export const searchStudentById = (studentId) => api.get(`/admin/search/${encodeURIComponent(studentId)}`);
export const createRegistration = (data) => api.post('/admin/registrations', data);
export const getAllRegistrations = () => api.get('/admin/registrations');
export const updateRegistration = (id, data) => api.put(`/admin/registrations/${id}`, data);

export default api;
