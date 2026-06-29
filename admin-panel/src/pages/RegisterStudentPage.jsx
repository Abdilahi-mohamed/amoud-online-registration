import React, { useState, useEffect } from 'react';
import { getAllRegistrations, registerStudentFull } from '../api';
import {
  UserPlus,
  Save,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  Lock,
} from 'lucide-react';

const INITIAL_FORM = {
  fullName: '',
  studentId: '',
  faculty: '',
  department: '',
  phone: '',
  email: '',
  gender: '',
  year: 'Sophomore',
  semester: '1',
  classId: 'Class A',
  password: '',
};

const RegisterStudentPage = ({ onSuccess, onClose, embedded = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileImage, setProfileImage] = useState('');
  const [existingIds, setExistingIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const loadExistingStudentIds = async () => {
      try {
        const response = await getAllRegistrations();
        const ids = response.data
          .map((r) => r.studentId?.trim())
          .filter(Boolean);
        setExistingIds(new Set(ids));
      } catch (err) {
        console.error('Failed to load existing student IDs', err);
      }
    };
    loadExistingStudentIds();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === 'studentId' && isError) {
      setIsError(false);
      setMessage(null);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      setIsError(true);
      setMessage('Profile image must be under 500KB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePreview(reader.result);
      setProfileImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const studentIdValue = formData.studentId.trim();
  const duplicateId = studentIdValue && existingIds.has(studentIdValue);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setIsError(false);

    if (!formData.password.trim()) {
      setIsError(true);
      setMessage('Password is required for the student account.');
      return;
    }

    if (duplicateId) {
      setIsError(true);
      setMessage('This Student ID is already registered. Use a different ID.');
      return;
    }

    setLoading(true);
    try {
      await registerStudentFull({
        ...formData,
        profileImage: profileImage || undefined,
      });
      setMessage('Student registered successfully.');
      setIsError(false);
      setExistingIds((prev) => new Set(prev).add(studentIdValue));
      setFormData(INITIAL_FORM);
      setProfilePreview(null);
      setProfileImage('');
      if (onSuccess) onSuccess();
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || 'Failed to register student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={embedded ? '' : 'reg-page'}>
      {!embedded && (
        <div className="reg-hero">
          <h1>Add Student</h1>
          <p>Manually register a student with a complete academic profile.</p>
        </div>
      )}

      {message && (
        <div className={`reg-alert ${isError ? 'error' : 'success'}`}>
          {isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="reg-form-card">
        <p className="reg-form-section-title">
          <User size={16} />
          Personal Information
        </p>
        <div className="reg-form-grid">
          <div className="reg-field">
            <label>Full Name</label>
            <input
              required
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="e.g. Ahmed Hassan Ali"
            />
          </div>
          <div className="reg-field">
            <label>Student ID</label>
            <input
              required
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              placeholder="e.g. STD-2026-001"
            />
            {duplicateId && (
              <p className="reg-field-error">This Student ID is already registered.</p>
            )}
          </div>
          <div className="reg-field">
            <label>Phone Number</label>
            <input
              required
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. +252 61 2345678"
            />
          </div>
          <div className="reg-field">
            <label>
              Email <span className="optional">(optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="student@university.edu"
            />
          </div>
          <div className="reg-field">
            <label>Gender</label>
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="reg-field">
            <label>
              Profile Image <span className="optional">(optional)</span>
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {profilePreview && (
              <img src={profilePreview} alt="Preview" className="reg-profile-preview" />
            )}
          </div>
        </div>

        <p className="reg-form-section-title" style={{ marginTop: '1.75rem' }}>
          <Mail size={16} />
          Academic Details
        </p>
        <div className="reg-form-grid">
          <div className="reg-field">
            <label>Faculty</label>
            <input
              required
              type="text"
              name="faculty"
              value={formData.faculty}
              onChange={handleChange}
              placeholder="e.g. Engineering & Technology"
            />
          </div>
          <div className="reg-field">
            <label>Department</label>
            <input
              required
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="reg-field">
            <label>Year Level</label>
            <select name="year" value={formData.year} onChange={handleChange}>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>
          <div className="reg-field">
            <label>Semester</label>
            <select name="semester" value={formData.semester} onChange={handleChange}>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>
          <div className="reg-field span-2">
            <label>Class</label>
            <select name="classId" value={formData.classId} onChange={handleChange}>
              <option value="Class A">Class A</option>
              <option value="Class B">Class B</option>
              <option value="Class C">Class C</option>
              <option value="Class D">Class D</option>
              <option value="Class E">Class E</option>
            </select>
          </div>
        </div>

        <p className="reg-form-section-title" style={{ marginTop: '1.75rem' }}>
          <Lock size={16} />
          Account Access
        </p>
        <div className="reg-form-grid">
          <div className="reg-field span-2">
            <label>Password</label>
            <input
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create login password for student"
              minLength={4}
            />
          </div>
        </div>

        <div className="reg-form-actions">
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1 }}>
            {loading ? (
              'Registering...'
            ) : (
              <>
                <Save size={16} />
                Register Student
              </>
            )}
          </button>
          {onClose && (
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegisterStudentPage;
