import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllRegistrations,
  registerStudentFull,
  updateRegistration,
  deleteRegistration,
} from '../api';
import {
  Users,
  UserPlus,
  List,
  Search,
  RefreshCw,
  Eye,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  User,
  BookOpen,
  Lock,
} from 'lucide-react';

const EMPTY_ADD_FORM = {
  fullName: '',
  studentId: '',
  faculty: '',
  department: '',
  year: '',
  semester: '',
  classId: '',
};

const PAGE_SIZE = 8;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStudentName = (reg) =>
  reg.studentName || reg.user?.fullName || reg.user?.username || 'Unknown';

const getPhone = (reg) => reg.user?.phone || '—';

const getRegistrationType = (reg) =>
  reg.registeredBy === 'admin' ? 'Admin Added' : 'Self Registered';

const RegistrationsPage = () => {
  const [view, setView] = useState('hub');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [formData, setFormData] = useState({ ...EMPTY_ADD_FORM });
  const [existingIds, setExistingIds] = useState(new Set());
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [viewingReg, setViewingReg] = useState(null);
  const [editingReg, setEditingReg] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [actionMessage, setActionMessage] = useState('');
  const [actionError, setActionError] = useState(false);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const res = await getAllRegistrations();
      setRegistrations(res.data || []);
    } catch (err) {
      console.error('Failed to load registrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (view === 'list') loadRegistrations();
  }, [view]);

  useEffect(() => {
    if (view === 'add') {
      const loadIds = async () => {
        try {
          const res = await getAllRegistrations();
          const ids = (res.data || []).map((r) => r.studentId?.trim()).filter(Boolean);
          setExistingIds(new Set(ids));
        } catch (err) {
          console.error('Failed to load student IDs', err);
        }
      };
      loadIds();
      setFormData({ ...EMPTY_ADD_FORM });
      setFormMessage('');
      setFormError(false);
    }
  }, [view]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const visible = registrations.filter(
      (reg) => reg.type === 'semester' && (reg.registeredBy === 'admin' || reg.registeredBy === 'self')
    );
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter((reg) => {
      const name = getStudentName(reg).toLowerCase();
      const id = (reg.studentId || '').toLowerCase();
      const faculty = (reg.faculty || reg.user?.faculty || '').toLowerCase();
      const department = (reg.department || reg.user?.department || '').toLowerCase();
      const year = (reg.year || reg.user?.year || '').toString().toLowerCase();
      const semester = (reg.semester || '').toString().toLowerCase();
      const className = (reg.className || reg.class?.name || reg.classId || '').toLowerCase();
      return (
        name.includes(q) ||
        id.includes(q) ||
        faculty.includes(q) ||
        department.includes(q) ||
        year.includes(q) ||
        semester.includes(q) ||
        className.includes(q)
      );
    });
  }, [registrations, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const handleFormChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const duplicateStudentId =
    formData.studentId.trim() && existingIds.has(formData.studentId.trim());

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormMessage('');
    setFormError(false);

    const id = formData.studentId.trim();

    if (
      !formData.fullName.trim() ||
      !id ||
      !formData.faculty.trim() ||
      !formData.department.trim() ||
      !formData.year ||
      !formData.semester ||
      !formData.classId
    ) {
      setFormError(true);
      setFormMessage('Please fill in all required fields.');
      return;
    }

    if (duplicateStudentId) {
      setFormError(true);
      setFormMessage('This Student ID is already registered.');
      return;
    }

    setSubmitting(true);
    try {
      await registerStudentFull({
        fullName: formData.fullName.trim(),
        studentId: id,
        faculty: formData.faculty.trim(),
        department: formData.department.trim(),
        year: formData.year,
        semester: formData.semester,
        classId: formData.classId,
      });
      setFormMessage('Student registered successfully.');
      setFormError(false);
      setExistingIds((prev) => new Set(prev).add(id));
      setFormData({ ...EMPTY_ADD_FORM });
      await loadRegistrations();
    } catch (err) {
      setFormError(true);
      setFormMessage(err.response?.data?.message || 'Failed to register student.');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (reg) => {
    setEditingReg(reg);
    setEditForm({
      studentId: reg.studentId || '',
      studentName: getStudentName(reg),
      phone: reg.user?.phone || '',
      faculty: reg.faculty || reg.user?.faculty || '',
      department: reg.department || reg.user?.department || '',
    });
    setActionMessage('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingReg) return;
    setLoading(true);
    setActionMessage('');
    try {
      await updateRegistration(editingReg._id, {
        studentId: editForm.studentId,
        studentName: editForm.studentName,
        phone: editForm.phone,
        faculty: editForm.faculty,
        department: editForm.department || editForm.faculty,
        year: editingReg.year || 'Sophomore',
        semester: String(editingReg.semester || '1'),
        className: editingReg.className || 'Class A',
      });
      setActionMessage('Updated successfully.');
      setActionError(false);
      setEditingReg(null);
      await loadRegistrations();
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Update failed.');
      setActionError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reg) => {
    if (!window.confirm('Delete this student registration?')) return;
    setLoading(true);
    try {
      await deleteRegistration(reg._id);
      setActionMessage('Deleted successfully.');
      setActionError(false);
      if (viewingReg?._id === reg._id) setViewingReg(null);
      if (editingReg?._id === reg._id) setEditingReg(null);
      await loadRegistrations();
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Delete failed.');
      setActionError(true);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'hub') {
    return (
      <div className="reg-page fade-in">
        <section className="reg-hero">
          <h1>Student Registration</h1>
          <p>Add new students or manage everyone already registered in the system.</p>
        </section>

        <div className="reg-hub-vertical">
          <button type="button" className="reg-hub-card" onClick={() => setView('add')}>
            <div className="reg-hub-card-icon green">
              <UserPlus size={26} />
            </div>
            <div className="reg-hub-card-body">
              <h3>Add Student</h3>
              <p>Full registration with academic details, contact info, and credentials.</p>
            </div>
          </button>

          <button type="button" className="reg-hub-card" onClick={() => { setView('list'); loadRegistrations(); }}>
            <div className="reg-hub-card-icon teal">
              <List size={26} />
            </div>
            <div className="reg-hub-card-body">
              <h3>View Registered Students</h3>
              <p>Browse, search, view, edit, or delete registered students.</p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (view === 'add') {
    return (
      <div className="reg-page fade-in">
        <button type="button" className="reg-back-btn" onClick={() => setView('hub')}>
          <ArrowLeft size={16} />
          Back to Student Registration
        </button>

        <section className="reg-hero reg-add-hero">
          <div className="payments-hero-left">
            <div className="payments-hero-icon">
              <UserPlus size={22} />
            </div>
            <div>
              <h1>Add Student</h1>
              <p>Complete student profile with academic and account details.</p>
            </div>
          </div>
        </section>

        <div className="reg-page-content reg-page-content-wide">
          <section className="reg-stack-card reg-add-form-card">
            {formMessage && (
              <div className={`reg-alert ${formError ? 'error' : 'success'}`} style={{ marginBottom: '1.5rem' }}>
                {formError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {formMessage}
              </div>
            )}

            <form onSubmit={handleAddStudent} className="reg-add-form" autoComplete="off">
              <div className="reg-form-block">
                <h3 className="reg-form-section-title">
                  <User size={16} />
                  Personal Information
                </h3>
                <div className="reg-form-grid">
                  <div className="reg-field">
                    <label htmlFor="add-fullName">Full Name *</label>
                    <input
                      id="add-fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleFormChange}
                      placeholder=""
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="reg-field">
                    <label htmlFor="add-studentId">Student ID *</label>
                    <input
                      id="add-studentId"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleFormChange}
                      placeholder=""
                      autoComplete="off"
                      className={duplicateStudentId ? 'reg-input-error' : ''}
                      required
                    />
                    {duplicateStudentId && (
                      <p className="reg-field-error">This Student ID is already registered.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="reg-form-block">
                <h3 className="reg-form-section-title">
                  <BookOpen size={16} />
                  Academic Details
                </h3>
                <div className="reg-form-grid">
                  <div className="reg-field">
                    <label htmlFor="add-faculty">Faculty *</label>
                    <input
                      id="add-faculty"
                      name="faculty"
                      value={formData.faculty}
                      onChange={handleFormChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="reg-field">
                    <label htmlFor="add-department">Department *</label>
                    <input
                      id="add-department"
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      placeholder=""
                      required
                    />
                  </div>
                  <div className="reg-field">
                    <label htmlFor="add-year">Year *</label>
                    <select
                      id="add-year"
                      name="year"
                      value={formData.year}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled>
                        Select year
                      </option>
                      <option value="Freshman">Freshman</option>
                      <option value="Sophomore">Sophomore</option>
                      <option value="Junior">Junior</option>
                      <option value="Senior">Senior</option>
                    </select>
                  </div>
                  <div className="reg-field">
                    <label htmlFor="add-class">Class *</label>
                    <select
                      id="add-class"
                      name="classId"
                      value={formData.classId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled>
                        Select class
                      </option>
                      <option value="Class A">Class A</option>
                      <option value="Class B">Class B</option>
                      <option value="Class C">Class C</option>
                      <option value="Class D">Class D</option>
                      <option value="Class E">Class E</option>
                    </select>
                  </div>
                  <div className="reg-field">
                    <label htmlFor="add-semester">Semester *</label>
                    <select
                      id="add-semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="" disabled>
                        Select semester
                      </option>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>
              </div>


              <div className="reg-form-actions">
                <button type="submit" className="reg-import-btn" disabled={submitting || duplicateStudentId}>
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Register Student
                    </>
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setView('hub')}>
                  Cancel
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="reg-page fade-in">
      <button type="button" className="reg-back-btn" onClick={() => setView('hub')}>
        <ArrowLeft size={16} />
        Back to Student Registration
      </button>

      <section className="reg-hero">
        <h1>View Registered Students</h1>
        <p>All students registered by admins and through the frontend.</p>
      </section>

      {actionMessage && (
        <div className={`reg-alert ${actionError ? 'error' : 'success'}`}>{actionMessage}</div>
      )}

      <section className="reg-table-card">
        <div className="reg-table-toolbar">
          <div>
            <h2>Registered Students</h2>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>
              {filtered.length} student{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem', alignItems: 'center' }}>
            <div className="reg-search-wrap">
              <Search size={16} />
              <input
                type="search"
                className="reg-search-input payments-search-input"
                placeholder="Search name, ID, faculty, department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button
              type="button"
              className="payments-refresh-btn"
              onClick={loadRegistrations}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        <div className="reg-table-wrap payments-table-wrap">
          <table className="reg-table payments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Faculty</th>
                <th>Department</th>
                <th>Year</th>
                <th>Semester</th>
                <th>Class</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && registrations.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="payments-loading">
                      <RefreshCw size={28} className="spin" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="payments-empty">
                      <div className="payments-empty-icon">
                        <Users size={28} />
                      </div>
                      <h3>No students found</h3>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((reg) => (
                  <tr key={reg._id}>
                    <td>
                      <div className="payments-student-cell">
                        <div className="payments-avatar">
                          {(getStudentName(reg)[0] || 'U').toUpperCase()}
                        </div>
                        <span className="payments-student-name">{getStudentName(reg)}</span>
                      </div>
                    </td>
                    <td>
                      <span className="payments-cell-mono">{reg.studentId || '—'}</span>
                    </td>
                    <td>{reg.faculty || reg.user?.faculty || '—'}</td>
                    <td>{reg.department || reg.user?.department || '—'}</td>
                    <td>{reg.year || reg.user?.year || '—'}</td>
                    <td>{reg.semester ? `Semester ${reg.semester}` : '—'}</td>
                    <td>{reg.className || reg.class?.name || reg.classId || '—'}</td>
                    <td>
                      <div className="reg-action-btns">
                        <button type="button" className="reg-icon-btn view" title="View" onClick={() => setViewingReg(reg)}>
                          <Eye size={15} />
                        </button>
                        <button type="button" className="reg-icon-btn edit" title="Edit" onClick={() => openEdit(reg)}>
                          <Pencil size={15} />
                        </button>
                        <button type="button" className="reg-icon-btn delete" title="Delete" onClick={() => handleDelete(reg)}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="reg-mobile-list">
          {paginated.map((reg) => (
            <article key={reg._id} className="reg-mobile-card">
              <div className="payments-student-name">{getStudentName(reg)}</div>
              <div className="payments-cell-mono">{reg.studentId}</div>
              <div className="payments-mobile-row">
                <label>Faculty</label>
                <span>{reg.faculty || reg.user?.faculty || '—'}</span>
              </div>
              <div className="payments-mobile-row">
                <label>Department</label>
                <span>{reg.department || reg.user?.department || '—'}</span>
              </div>
              <div className="payments-mobile-row">
                <label>Year</label>
                <span>{reg.year || reg.user?.year || '—'}</span>
              </div>
              <div className="payments-mobile-row">
                <label>Semester</label>
                <span>{reg.semester ? `Semester ${reg.semester}` : '—'}</span>
              </div>
              <div className="payments-mobile-row">
                <label>Class</label>
                <span>{reg.className || reg.class?.name || reg.classId || '—'}</span>
              </div>
              <div className="reg-action-btns" style={{ marginTop: '0.75rem' }}>
                <button type="button" className="reg-icon-btn view" onClick={() => setViewingReg(reg)}><Eye size={15} /></button>
                <button type="button" className="reg-icon-btn edit" onClick={() => openEdit(reg)}><Pencil size={15} /></button>
                <button type="button" className="reg-icon-btn delete" onClick={() => handleDelete(reg)}><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>

        <div className="reg-pagination">
          <span>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="reg-pagination-btns">
            <button type="button" className="reg-page-btn" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || (n >= page - 1 && n <= page + 1))
              .map((n, idx, arr) => {
                const prev = arr[idx - 1];
                const ellipsis = prev && n - prev > 1;
                return (
                  <React.Fragment key={n}>
                    {ellipsis && <span>…</span>}
                    <button
                      type="button"
                      className={`reg-page-btn ${page === n ? 'active' : ''}`}
                      onClick={() => setPage(n)}
                    >
                      {n}
                    </button>
                  </React.Fragment>
                );
              })}
            <button type="button" className="reg-page-btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {viewingReg && (
        <div className="reg-modal-overlay" onClick={() => setViewingReg(null)}>
          <div className="reg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="reg-modal-header">
              <h3>Student Details</h3>
              <button type="button" className="reg-modal-close" onClick={() => setViewingReg(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="reg-modal-body reg-detail-grid">
              <div className="reg-detail-item"><label>Name</label><p>{getStudentName(viewingReg)}</p></div>
              <div className="reg-detail-item"><label>Student ID</label><p>{viewingReg.studentId || '—'}</p></div>
              <div className="reg-detail-item"><label>Phone</label><p>{getPhone(viewingReg)}</p></div>
              <div className="reg-detail-item"><label>Type</label><p>{getRegistrationType(viewingReg)}</p></div>
              <div className="reg-detail-item"><label>Faculty</label><p>{viewingReg.faculty || viewingReg.user?.faculty || '—'}</p></div>
              <div className="reg-detail-item"><label>Registered</label><p>{formatDate(viewingReg.createdAt)}</p></div>
            </div>
          </div>
        </div>
      )}

      {editingReg && (
        <div className="reg-modal-overlay" onClick={() => setEditingReg(null)}>
          <div className="reg-modal lg" onClick={(e) => e.stopPropagation()}>
            <div className="reg-modal-header">
              <h3>Edit Student</h3>
              <button type="button" className="reg-modal-close" onClick={() => setEditingReg(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="reg-modal-body">
              <form onSubmit={handleUpdate} className="reg-simple-form">
                <div className="reg-form-grid">
                  <div className="reg-field">
                    <label>Full Name</label>
                    <input name="studentName" value={editForm.studentName} onChange={(e) => setEditForm({ ...editForm, studentName: e.target.value })} required />
                  </div>
                  <div className="reg-field">
                    <label>Student ID</label>
                    <input name="studentId" value={editForm.studentId} onChange={(e) => setEditForm({ ...editForm, studentId: e.target.value })} required />
                  </div>
                  <div className="reg-field">
                    <label>Phone</label>
                    <input name="phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div className="reg-field">
                    <label>Faculty</label>
                    <input name="faculty" value={editForm.faculty} onChange={(e) => setEditForm({ ...editForm, faculty: e.target.value })} />
                  </div>
                  <div className="reg-field">
                    <label>Department</label>
                    <input name="department" value={editForm.department} onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} />
                  </div>
                </div>
                <div className="reg-form-actions">
                  <button type="submit" className="reg-import-btn" disabled={loading} style={{ flex: 1 }}>Save Changes</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditingReg(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationsPage;
