const BASE_URL = 'http://localhost:5000/api';

const loginSection = document.getElementById('login-section');
const adminSection = document.getElementById('admin-section');
const loginError = document.getElementById('loginError');
const output = document.getElementById('output');

let token = null;

const setAuthHeader = () => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
});

const showOutput = (data) => {
    output.textContent = JSON.stringify(data, null, 2);
};

const login = async () => {
    const username = document.getElementById('user').value;
    const password = document.getElementById('pass').value;

    try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: setAuthHeader(),
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (!res.ok) {
            loginError.textContent = data.message || 'Login failed';
            return;
        }

        if (data.token) {
            token = data.token;
            loginSection.classList.add('hidden');
            adminSection.classList.remove('hidden');
            loginError.textContent = '';
            showOutput({ message: 'Logged in successfully' });
        }
    } catch (err) {
        loginError.textContent = 'Network error';
    }
};

const loadDashboard = async () => {
    try {
        const res = await fetch(`${BASE_URL}/admin/dashboard`, {
            headers: setAuthHeader()
        });
        const data = await res.json();
        showOutput(data);
    } catch (err) {
        showOutput({ error: err.message });
    }
};

const loadPayments = async () => {
    try {
        const res = await fetch(`${BASE_URL}/payments`, {
            headers: setAuthHeader()
        });
        const data = await res.json();
        showOutput(data);
    } catch (err) {
        showOutput({ error: err.message });
    }
};

const searchStudent = async () => {
    const studentId = document.getElementById('studentSearch').value;
    if (!studentId) return;

    try {
        const res = await fetch(`${BASE_URL}/admin/search/${encodeURIComponent(studentId)}`, {
            headers: setAuthHeader()
        });
        const data = await res.json();
        showOutput(data);
    } catch (err) {
        showOutput({ error: err.message });
    }
};

const createRegistration = async () => {
    const userId = document.getElementById('reg-userid').value;
    const semester = Number(document.getElementById('reg-semester').value);
    const department = document.getElementById('reg-department').value;
    const classId = document.getElementById('reg-class').value;

    try {
        const res = await fetch(`${BASE_URL}/admin/registrations`, {
            method: 'POST',
            headers: setAuthHeader(),
            body: JSON.stringify({ userId, semester, department, classId })
        });
        const data = await res.json();
        showOutput(data);
    } catch (err) {
        showOutput({ error: err.message });
    }
};

const logout = () => {
    token = null;
    adminSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    output.textContent = '';
};

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('dashboardBtn').addEventListener('click', loadDashboard);
document.getElementById('paymentsBtn').addEventListener('click', loadPayments);
document.getElementById('searchBtn').addEventListener('click', searchStudent);
document.getElementById('createRegBtn').addEventListener('click', createRegistration);
document.getElementById('logoutBtn').addEventListener('click', logout);
