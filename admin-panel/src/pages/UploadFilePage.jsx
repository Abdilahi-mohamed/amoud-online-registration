import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { bulkRegisterWithExcel } from '../api';
import { isValidSpreadsheetFile } from '../utils/fileValidation';
import UploadSingleStudentForm from '../components/UploadSingleStudentForm';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileUp,
  Loader2,
  UserPlus,
  Shield,
} from 'lucide-react';

const UploadFilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const selectFile = useCallback((selected) => {
    setFileError('');
    setUploadResult(null);
    setUploadError('');
    if (!selected) {
      setFile(null);
      return;
    }
    if (!isValidSpreadsheetFile(selected)) {
      setFile(null);
      setFileError('Only .xlsx and .csv files are allowed.');
      return;
    }
    setFile(selected);
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    selectFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');
    setUploadResult(null);

    try {
      const response = await bulkRegisterWithExcel(file, (event) => {
        if (event.total) {
          setUploadProgress(Math.min(100, Math.round((event.loaded * 100) / event.total)));
        }
      });
      setUploadProgress(100);
      setUploadResult(response.data);
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setUploadError(err.response?.data?.message || err.message || 'Import failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="reg-page fade-in">
      <section className="reg-hero reg-page-hero" style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <div className="payments-hero-left">
          <div className="payments-hero-icon">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h1>Upload File</h1>
            <p>Bulk import from Excel/CSV or register one student manually below.</p>
          </div>
        </div>
      </section>

      <div className="reg-upload-page-stack">
        <div className="reg-upload-row">
          {/* Section 1 — Upload Excel File */}
          <section className="reg-stack-card">
            <div className="reg-stack-card-header">
              <div className="reg-stack-card-icon upload">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h2>Upload Excel File</h2>
                <p>Import multiple students from a spreadsheet at once.</p>
              </div>
            </div>

          <div
            className={`reg-dropzone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv"
              style={{ display: 'none' }}
              onChange={(e) => selectFile(e.target.files?.[0])}
            />
            <div className="reg-dropzone-icon">
              <Upload size={32} />
            </div>
            <h3>Drag & drop your file here</h3>
            <p>or click to browse · .xlsx and .csv only</p>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6b7280' }}>
              Required columns: <strong>studentId</strong> (or ID) and <strong>password</strong>
            </p>
            {file && <p className="file-name">{file.name}</p>}
          </div>

          {fileError && (
            <div className="reg-alert error" style={{ marginTop: '1rem' }}>
              <AlertCircle size={18} />
              {fileError}
            </div>
          )}

          {uploading && (
            <div className="reg-progress-wrap">
              <div className="reg-progress-label">
                <span>Uploading & importing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="reg-progress-bar">
                <div className="reg-progress-fill" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <button
            type="button"
            className="reg-import-btn"
            disabled={!file || uploading}
            onClick={handleImport}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="spin" />
                Importing...
              </>
            ) : (
              <>
                <FileUp size={18} />
                Upload & Import
              </>
            )}
          </button>

          {uploadError && (
            <div className="reg-alert error" style={{ marginTop: '1rem' }}>
              <AlertCircle size={18} />
              {uploadError}
            </div>
          )}

          {uploadResult && (
            <div className="reg-upload-results">
              <CheckCircle2 size={18} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
              {uploadResult.successCount} student{uploadResult.successCount !== 1 ? 's' : ''} added to the database
              and enabled for frontend Secondary Login.
              {uploadResult.skippedCount > 0 && ` · ${uploadResult.skippedCount} duplicate(s) skipped`}
              {uploadResult.failedCount > 0 && ` · ${uploadResult.failedCount} failed`}
              {uploadResult.failed?.length > 0 && (
                <ul style={{ margin: '0.75rem 0 0', paddingLeft: '1.25rem', fontSize: '0.8rem' }}>
                  {uploadResult.failed.slice(0, 5).map((f, i) => (
                    <li key={i}>
                      {f.username || f.row}: {f.reason}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>

        {/* Section 2 — Register Single Student */}
          <section className="reg-stack-card">
            <div className="reg-stack-card-header">
              <div className="reg-stack-card-icon single">
                <UserPlus size={24} />
              </div>
              <div>
                <h2>Register Single Student</h2>
                <p>Register one student using numeric ID and password only.</p>
              </div>
            </div>

            <UploadSingleStudentForm />
          </section>
        </div>

        {/* Section 3 — View Credentials Table */}
        <section className="reg-stack-card">
          <div className="reg-stack-card-header">
            <div className="reg-stack-card-icon upload">
              <Shield size={24} />
            </div>
            <div>
              <h2>View Credentials Table</h2>
              <p>See all Student IDs and Passwords added through uploads or single registration.</p>
            </div>
          </div>

          <div className="p-6 rounded-3xl border border-[#262c3a] bg-slate-950/50">
            <p className="text-sm text-slate-400 mb-4">
              This table loads data directly from the database and displays imported upload credentials together with single student entries.
            </p>
            <button
              type="button"
              className="reg-import-btn"
              onClick={() => navigate('/upload-file/credentials')}
            >
              View Credentials Table
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default UploadFilePage;
