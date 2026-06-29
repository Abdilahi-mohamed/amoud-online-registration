import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import PaymentsPage from './pages/PaymentsPage';
import RegistrationsPage from './pages/RegistrationsPage';
import UploadFilePage from './pages/UploadFilePage';
import AllowedCredentialsPage from './pages/AllowedCredentialsPage';
import RegisterSingleStudentPage from './pages/RegisterSingleStudentPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  const handleLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage onLogin={handleLogin} /> : <Navigate to="/" />}
        />

        <Route
          element={
            isAuthenticated ? (
              <DashboardLayout onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" />
            )
          }
        >
          <Route path="/" element={<Navigate to="/payments" replace />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/registrations/view" element={<RegistrationsPage />} />
          <Route path="/upload-file" element={<UploadFilePage />} />
          <Route path="/upload-file/credentials" element={<AllowedCredentialsPage />} />
          <Route path="/register-single-student" element={<RegisterSingleStudentPage />} />
          <Route path="/register-student" element={<Navigate to="/upload-file" replace />} />
          <Route path="/registrations/upload" element={<Navigate to="/upload-file" replace />} />
          <Route path="/registrations/register" element={<Navigate to="/registrations/view" replace />} />
          <Route path="/registrations/bulk" element={<Navigate to="/upload-file" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
