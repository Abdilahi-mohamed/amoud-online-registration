import React, { useState } from 'react';
import { loginUser, registerAdmin } from '../api';
import { GraduationCap, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isRegistering) {
        await registerAdmin(username, password);
        setSuccess('Admin registered successfully! You can now log in.');
        setIsRegistering(false);
        setPassword('');
      } else {
        const response = await loginUser(username, password);
        if (response.data.role !== 'admin') {
          throw new Error('Access denied. Admin only.');
        }
        onLogin(response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || (isRegistering ? 'Registration failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass">
        <div className="login-header">
          <div className="logo-icon">
            <GraduationCap size={32} />
          </div>
          <h1>UniReg Admin</h1>
          <p>{isRegistering ? 'Create new admin account' : 'Login to manage student registrations'}</p>
        </div>

        {error && (
          <div className="error-alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-alert">
            <CheckCircle size={18} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label>Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3" disabled={loading}>
            {loading ? (isRegistering ? 'Registering...' : 'Signing in...') : (isRegistering ? 'Register' : 'Sign In')}
          </button>
          
          <div className="toggle-view">
            <button 
              type="button" 
              className="toggle-btn"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError('');
                setSuccess('');
              }}
            >
              {isRegistering ? 'Already have an account? Sign In' : 'Need an admin account? Register'}
            </button>
          </div>
        </form>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .login-page {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent),
                      radial-gradient(circle at bottom left, rgba(5, 150, 105, 0.08), transparent);
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          padding: 40px;
          border-radius: 24px;
          box-shadow: 0 20px 40px -12px rgba(16, 185, 129, 0.15);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-icon {
          width: 64px;
          height: 64px;
          background: var(--primary);
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: white;
          box-shadow: 0 8px 16px rgba(16, 185, 129, 0.3);
        }

        .login-header h1 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 8px;
          color: #111827;
        }

        .login-header p {
          color: var(--text-muted);
          font-size: 14px;
        }

        .login-form .input-group {
          margin-bottom: 20px;
        }

        .login-form label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 8px;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
        }

        .login-form input {
          width: 100%;
          padding: 12px 12px 12px 42px;
          background: #ffffff;
          border: 1px solid var(--border-light);
          border-radius: 12px;
          color: #1f2937;
          outline: none;
          transition: border-color 0.2s;
        }

        .login-form input:focus {
          border-color: var(--primary);
        }

        .error-alert {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: var(--danger);
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 500;
        }

        .success-alert {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          color: #10b981;
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          font-size: 13px;
          font-weight: 500;
        }

        .toggle-view {
          margin-top: 24px;
          text-align: center;
        }

        .toggle-btn {
          background: none;
          border: none;
          color: var(--primary);
          font-size: 14px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .toggle-btn:hover {
          color: #047857;
          text-decoration: underline;
        }
      `}} />
    </div>
  );
};

export default LoginPage;
