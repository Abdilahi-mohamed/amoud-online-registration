import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { registerStudentFull, updateAllowedCredential } from '../api';
import {
  UserPlus,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';

const RegisterSingleStudentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialCredentialId = location.state?.credentialId || null;
  const initialStudentId = location.state?.studentId || '';

  const [credentialId, setCredentialId] = useState(initialCredentialId);
  const [studentId, setStudentId] = useState(initialStudentId);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [faculty, setFaculty] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (location.state?.credentialId) {
      setCredentialId(location.state.credentialId);
    }
    if (location.state?.studentId) {
      setStudentId(location.state.studentId);
    }
  }, [location.state]);

  const isEditMode = Boolean(credentialId);

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

    setSubmitting(true);
    try {
      if (isEditMode) {
        await updateAllowedCredential(credentialId, id, pass);
        navigate('/upload-file/credentials', { replace: true });
        return;
      }

      const facultyVal = faculty.trim() || 'General';
      await registerStudentFull({
        fullName: fullName.trim() || id,
        studentId: id,
        password: pass,
        faculty: facultyVal,
        department: facultyVal,
        phone: phone.trim() || undefined,
        year: 'Sophomore',
        semester: '1',
        classId: 'Class A',
      });
      setMessage(`Student "${id}" registered successfully.`);
      setIsError(false);
      setStudentId('');
      setPassword('');
      setFullName('');
      setPhone('');
      setFaculty('');
    } catch (err) {
      setIsError(true);
      setMessage(err.response?.data?.message || (isEditMode ? 'Failed to update credential.' : 'Failed to register student.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reg-page fade-in">
      <section className="reg-hero reg-page-hero">
        <div className="payments-hero-left">
          <div className="payments-hero-icon">
            <UserPlus size={22} />
          </div>
          <div>
            <h1>Register Single Student</h1>
            <p>Manually create one student account with login credentials.</p>
          </div>
        </div>
      </section>

      <div className="reg-page-content">
        <section className="reg-stack-card">
          {isEditMode && (
            <div className="reg-alert info" style={{ marginBottom: '1rem' }}>
              Updating credential for <strong>{studentId}</strong>. After save, you will be returned to the credentials table.
            </div>
          )}
          {message && (
            <div className={`reg-alert ${isError ? 'error' : 'success'}`} style={{ marginBottom: '1.5rem' }}>
              {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="reg-simple-form">
            <p className="reg-form-section-title" style={{ marginTop: 0 }}>
              Required
            </p>

            <div className="reg-field">
              <label>Student ID</label>
              <input
                type="text"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="e.g. STD-2026-001"
                required
              />
            </div>

            <div className="reg-field">
              <label>Password</label>
              <div className="reg-password-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isEditMode ? 'Enter new password' : 'Create login password'}
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

            {!isEditMode && (
              <>
                <p className="reg-optional-divider">Optional</p>

                <div className="reg-field">
                  <label>
                    Full Name <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Student full name"
                  />
                </div>

                <div className="reg-field">
                  <label>
                    Phone Number <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +252 61 2345678"
                  />
                </div>

                <div className="reg-field">
                  <label>
                    Faculty <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="e.g. Engineering & Technology"
                  />
                </div>
              </>
            )}

            <button type="submit" className="reg-import-btn" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 size={18} className="spin" />
                  {isEditMode ? 'Updating...' : 'Registering...'}
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  {isEditMode ? 'Update Credential' : 'Register Student'}
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default RegisterSingleStudentPage;
