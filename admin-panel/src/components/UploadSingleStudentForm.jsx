import React, { useState } from 'react';
import { registerStudentFull } from '../api';
import { UserPlus, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

const digitsOnly = (value) => value.replace(/\D/g, '');

/** Single-student form on the Upload File page — Student ID (numbers only) + Password */
const UploadSingleStudentForm = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleStudentIdChange = (e) => {
    setStudentId(digitsOnly(e.target.value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    const id = studentId.trim();
    const pass = password.trim();

    if (!id || !pass) {
      setIsError(true);
      setMessage('Student ID and Password are required.');
      return;
    }

    if (!/^\d+$/.test(id)) {
      setIsError(true);
      setMessage('Student ID must contain numbers only.');
      return;
    }

    setSubmitting(true);
    try {
      await registerStudentFull({
        fullName: id,
        studentId: id,
        password: pass,
        faculty: 'General',
        department: 'General',
        year: 'Sophomore',
        semester: '1',
        classId: 'Class A',
      });
      setMessage(
        `Student ID "${id}" registered. They can log in on the frontend Secondary Login page with this ID and password.`
      );
      setIsError(false);
      setStudentId('');
      setPassword('');
      setShowPassword(false);
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || 'Failed to register student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {message && (
        <div className={`reg-alert ${isError ? 'error' : 'success'}`} style={{ marginBottom: '1.25rem' }}>
          {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="reg-simple-form" autoComplete="off">
        <div className="reg-field">
          <label htmlFor="upload-student-id">Student ID *</label>
          <input
            id="upload-student-id"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={studentId}
            onChange={handleStudentIdChange}
            placeholder=""
            autoComplete="off"
            required
          />
          <p className="reg-field-hint">Numbers only — no letters or special characters.</p>
        </div>

        <div className="reg-field">
          <label htmlFor="upload-student-password">Password *</label>
          <div className="reg-password-wrap">
            <input
              id="upload-student-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="reg-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="reg-import-btn" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 size={18} className="spin" />
              Registering...
            </>
          ) : (
            <>
              <UserPlus size={18} />
              Register Student
            </>
          )}
        </button>
      </form>
    </>
  );
};

export default UploadSingleStudentForm;
