import React, { useState, useEffect } from 'react';
import { uploadCredentialsExcel, getAllAllowedCredentials, addSingleCredential } from '../api';
import { Upload, CheckCircle2, AlertCircle, Info, Lock, UserPlus, Key, Eye, EyeOff, List, Shield, RefreshCw } from 'lucide-react';

const UploadCredentialsPage = () => {
  // Bulk upload states
  const [file, setFile] = useState(null);
  const [loadingBulk, setLoadingBulk] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState(null);

  // Single student registration states
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingSingle, setLoadingSingle] = useState(false);
  const [singleSuccess, setSingleSuccess] = useState(null);
  const [singleError, setSingleError] = useState(null);

  // Allowed credentials list state
  const [credentials, setCredentials] = useState([]);
  const [loadingList, setLoadingList] = useState(false);

  // Validation states
  const [studentIdTouched, setStudentIdTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Fetch allowed credentials list
  const fetchCredentials = async () => {
    setLoadingList(true);
    try {
      const response = await getAllAllowedCredentials();
      setCredentials(response.data);
    } catch (err) {
      console.error('Failed to fetch credentials list:', err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchCredentials();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setBulkResults(null);
      setBulkError(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) return;
    setLoadingBulk(true);
    setBulkError(null);
    try {
      const response = await uploadCredentialsExcel(file);
      setBulkResults(response.data);
      setFile(null);
      // Automatically refresh credentials list
      await fetchCredentials();
    } catch (err) {
      setBulkError('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingBulk(false);
    }
  };

  const handleAddSingleStudent = async (e) => {
    e.preventDefault();
    setStudentIdTouched(true);
    setPasswordTouched(true);

    if (!studentId.trim() || !password.trim()) {
      setSingleError('Both Student ID and Password fields are required.');
      return;
    }

    setLoadingSingle(true);
    setSingleError(null);
    setSingleSuccess(null);

    try {
      const response = await addSingleCredential(studentId.trim(), password.trim());
      setSingleSuccess(response.data.message || `Student "${studentId.trim()}" added successfully.`);
      
      // Reset form fields
      setStudentId('');
      setPassword('');
      setStudentIdTouched(false);
      setPasswordTouched(false);

      // Automatically refresh credentials list
      await fetchCredentials();
    } catch (err) {
      setSingleError(err.response?.data?.message || 'Failed to add student. Please try again.');
    } finally {
      setLoadingSingle(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 border border-[#262c3a] bg-gradient-to-r from-slate-900/60 to-slate-900/40">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/5 blur-xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
              <Lock className="text-emerald-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">Access Control & Credentials</h1>
              <p className="text-slate-400 text-sm">Register allowed students manually or upload an Excel sheet to restrict portal access.</p>
            </div>
          </div>

          <button
            onClick={fetchCredentials}
            disabled={loadingList}
            className="btn btn-primary py-3.5 px-6 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            <RefreshCw size={16} className={loadingList ? 'animate-spin' : ''} />
            {loadingList ? 'Syncing list...' : 'Sync Roster'}
          </button>
        </div>
      </div>

      {/* Forms Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side: Single Student Form */}
        <div className="glass p-8 rounded-3xl border border-[#262c3a] space-y-6 relative overflow-hidden bg-slate-900/30">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <UserPlus size={120} className="text-emerald-400" />
          </div>

          <div className="border-b border-[#262c3a]/60 pb-4 flex items-center gap-2.5">
            <UserPlus className="text-emerald-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Single Registration</h2>
              <p className="text-slate-400 text-xs mt-0.5">Manually register a single Student ID and Password instantly.</p>
            </div>
          </div>

          {singleSuccess && (
            <div className="p-4.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3 fade-in">
              <CheckCircle2 size={20} />
              <p className="font-semibold text-sm">{singleSuccess}</p>
            </div>
          )}

          {singleError && (
            <div className="p-4.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 fade-in">
              <AlertCircle size={20} />
              <p className="font-semibold text-sm">{singleError}</p>
            </div>
          )}

          <form onSubmit={handleAddSingleStudent} className="space-y-5">
            {/* Student ID */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Student ID Code <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. STU12345"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    if (singleError) setSingleError(null);
                  }}
                  onBlur={() => setStudentIdTouched(true)}
                  className={`w-full bg-slate-900 border ${
                    studentIdTouched && !studentId.trim() ? 'border-rose-500/60' : 'border-[#262c3a]'
                  } rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium`}
                />
              </div>
              {studentIdTouched && !studentId.trim() && (
                <p className="text-rose-400 text-xs font-semibold">Student ID is required.</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-200">
                Access Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter access password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (singleError) setSingleError(null);
                  }}
                  onBlur={() => setPasswordTouched(true)}
                  className={`w-full bg-slate-900 border ${
                    passwordTouched && !password.trim() ? 'border-rose-500/60' : 'border-[#262c3a]'
                  } rounded-xl pl-4 pr-12 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-medium`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordTouched && !password.trim() && (
                <p className="text-rose-400 text-xs font-semibold">Password is required.</p>
              )}
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1 font-medium">
                <Shield size={12} className="text-emerald-400" />
                This password will be securely hashed with Bcrypt automatically.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loadingSingle}
              className="btn btn-primary w-full py-3.5 flex justify-center text-sm font-bold tracking-wide mt-2"
            >
              {loadingSingle ? (
                <span className="flex items-center gap-2">
                  <RefreshCw size={16} className="animate-spin" /> Authorizing...
                </span>
              ) : (
                'Add Student'
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Bulk Excel Upload */}
        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl border border-[#262c3a] space-y-6 bg-slate-900/30">
            <div className="border-b border-[#262c3a]/60 pb-4 flex items-center gap-2.5">
              <Upload className="text-indigo-400" size={24} />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Bulk Credential Upload</h2>
                <p className="text-slate-400 text-xs mt-0.5">Upload a sheet with ID and Password columns to set allowed list.</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#262c3a] rounded-2xl bg-slate-900/50">
              <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-400 mb-4 border border-indigo-500/20 shadow-md">
                <Upload size={32} />
              </div>
              
              <input 
                type="file"
                onChange={handleFileChange}
                accept=".xlsx,.xls,.csv"
                className="w-full max-w-sm text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-500/20 file:text-indigo-400 hover:file:bg-indigo-500/30 file:cursor-pointer bg-slate-950 border border-[#262c3a] rounded-xl p-2.5 cursor-pointer font-medium"
              />

              {file && (
                <p className="text-indigo-400 text-xs mt-3 font-semibold">Selected: <span className="text-white font-mono">{file.name}</span></p>
              )}
            </div>

            <button 
              onClick={handleBulkUpload}
              disabled={!file || loadingBulk}
              className={`w-full py-3.5 rounded-xl text-sm font-bold tracking-wide transition-all ${
                !file || loadingBulk 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-[#262c3a]' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.01]'
              }`}
            >
              {loadingBulk ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw size={14} className="animate-spin" /> Uploading sheet...
                </span>
              ) : (
                'Upload Excel'
              )}
            </button>

            {bulkError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-3 fade-in">
                <AlertCircle size={20} />
                <p className="font-semibold text-sm">{bulkError}</p>
              </div>
            )}

            {bulkResults && (
              <div className="glass rounded-2xl border border-emerald-500/30 overflow-hidden fade-in bg-emerald-500/5">
                <div className="p-4 border-b border-emerald-500/20 bg-emerald-500/5">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Bulk Registry Synchronized
                  </h3>
                </div>
                <div className="grid grid-cols-2 divide-x divide-[#262c3a]">
                  <div className="p-4 text-center">
                    <div className="text-2xl font-extrabold text-white">{bulkResults.totalImported}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Imported</div>
                  </div>
                  <div className="p-4 text-center">
                    <div className="text-2xl font-extrabold text-rose-400">{bulkResults.skippedCount}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Skipped</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Excel Formatting Instructions */}
          <div className="glass p-6 rounded-2xl border border-[#262c3a] space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-[#262c3a]/40 pb-2.5">
              <Info size={16} className="text-indigo-400" /> Excel Format Instructions
            </h4>
            <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
              <p>Your Excel file strictly MUST contain columns with headers:</p>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-[#262c3a] font-mono text-[11px] text-slate-200 flex justify-around">
                <span className="font-bold text-indigo-400">ID</span>
                <span className="text-slate-500">|</span>
                <span className="font-bold text-indigo-400">Password</span>
              </div>
              <p className="text-[11px] text-amber-400/80 leading-normal flex items-start gap-1">
                <span>⚠️</span>
                <span><strong>Warning:</strong> Uploading Excel list clears all previously allowed credentials. Use the form on the left if you only want to append a single student without resetting the allowed list.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Allowed Credentials Student List */}
      <div className="glass rounded-3xl border border-[#262c3a] overflow-hidden bg-slate-900/10">
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#262c3a]/60 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
              <List className="text-emerald-400" size={20} /> Authorized Portal Roster
            </h2>
            <p className="text-xs text-slate-400">Roster of authorized credentials allowed to log in via secondary auth screen.</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-[#262c3a] text-xs font-extrabold text-slate-300 font-mono tracking-wider shadow-inner">
            {credentials.length} STUDENTS ALLOWED
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingList && credentials.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              <RefreshCw className="animate-spin mx-auto mb-3" size={28} />
              Syncing authorized credentials...
            </div>
          ) : credentials.length === 0 ? (
            <div className="p-16 text-center text-slate-400 space-y-2">
              <Lock className="mx-auto opacity-30 text-indigo-400" size={36} />
              <p className="font-semibold text-slate-300">Authorized list is currently empty</p>
              <p className="text-xs text-slate-500">Use the single registration form or bulk upload file loader to add students.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Password Protocol</th>
                  <th>Date Allowed</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred) => {
                  const isHashed = cred.password.startsWith('$2a$') || cred.password.startsWith('$2b$');
                  return (
                    <tr key={cred._id} className="hover:bg-slate-800/25 transition-colors">
                      <td className="font-mono text-emerald-400 font-bold tracking-wide">
                        {cred.studentId}
                      </td>
                      <td>
                        {isHashed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                            <Shield size={12} /> Hashed (Bcrypt)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
                            <Eye size={12} /> Plain Text
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="text-xs text-slate-400 font-semibold">
                          {new Date(cred.createdAt).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .hidden { display: none; }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default UploadCredentialsPage;
