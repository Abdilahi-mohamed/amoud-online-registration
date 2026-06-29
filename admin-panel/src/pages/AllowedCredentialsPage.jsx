import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllAllowedCredentials, deleteAllowedCredential } from '../api';
import { Shield, Key, RefreshCw, Search, ArrowLeft } from 'lucide-react';

const AllowedCredentialsPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadCredentials = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllAllowedCredentials();
      setCredentials(res.data || []);
    } catch (err) {
      console.error('Failed to load credentials', err);
      setError(err.response?.data?.message || 'Failed to load credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCredentials();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return credentials;
    return credentials.filter((cred) => {
      return cred.studentId?.toLowerCase().includes(q);
    });
  }, [credentials, search]);

  const handleEditCredential = (credential) => {
    navigate('/register-single-student', {
      state: {
        credentialId: credential._id,
        studentId: credential.studentId,
      },
    });
  };

  const handleDeleteCredential = async (credential) => {
    if (!window.confirm(`Delete allowed credential for "${credential.studentId}"?`)) {
      return;
    }
    setLoading(true);
    setError('');

    try {
      await deleteAllowedCredential(credential._id);
      await loadCredentials();
    } catch (err) {
      console.error('Failed to delete credential', err);
      setError(err.response?.data?.message || 'Failed to delete credential.');
      setLoading(false);
    }
  };

  return (
    <div className="reg-page fade-in">
      <section className="reg-page-hero" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div className="payments-hero-left">
          <div className="payments-hero-icon">
            <Shield size={22} />
          </div>
          <div>
            <h1>Uploaded Credentials</h1>
            <p>All stored Student IDs and Passwords from file uploads and single student registration.</p>
          </div>
        </div>
      </section>

      <div className="reg-upload-page-stack">
        <section className="reg-stack-card" style={{ width: '100%' }}>
          <div className="reg-stack-card-header">
            <div className="reg-stack-card-icon upload">
              <Key size={24} />
            </div>
            <div>
              <h2>Credential Table</h2>
              <p>Data is loaded directly from the database for both file imports and single student registration.</p>
            </div>
          </div>

          <div className="reg-stack-card-toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div className="payments-search-wrap" style={{ flex: '1 1 320px', minWidth: 0 }}>
              <Search size={16} />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search student ID..."
                className="payments-search-input"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" className="payments-refresh-btn" onClick={loadCredentials} disabled={loading}>
                <RefreshCw size={16} className={loading ? 'spin' : ''} />
                Refresh
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/upload-file')}>
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>
          {error && (
            <div className="reg-alert error" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="reg-table-wrap payments-table-wrap">
            <table className="reg-table payments-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Password</th>
                  <th>Operations</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="payments-loading">
                        <RefreshCw size={32} className="spin" />
                        Loading credentials...
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={3}>
                      <div className="payments-empty">
                        <div className="payments-empty-icon">
                          <Shield size={28} />
                        </div>
                        <h3>No credentials available</h3>
                        <p>Upload a file or register a student to populate this table.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((cred) => (
                    <tr key={cred._id}>
                      <td>
                        <span className="payments-cell-mono">{cred.studentId}</span>
                      </td>
                      <td>
                        <span className="payments-cell-mono"></span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ minWidth: '10rem' }}
                            onClick={() => handleEditCredential(cred)}
                          >
                            Change Password
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ minWidth: '8rem' }}
                            onClick={() => handleEditCredential(cred)}
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ minWidth: '8rem' }}
                            onClick={() => handleDeleteCredential(cred)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AllowedCredentialsPage;
