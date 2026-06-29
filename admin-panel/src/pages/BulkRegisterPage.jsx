import React, { useState } from 'react';
import { bulkRegisterWithExcel } from '../api';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, XCircle, Info, RefreshCw } from 'lucide-react';

const BulkRegisterPage = ({ onDone, onClose }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const response = await bulkRegisterWithExcel(file);
      setResults(response.data);
      if (onDone) onDone(response.data);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-[#262c3a]/60 pb-6">
        <div className="bg-indigo-500/10 p-3 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
          <FileSpreadsheet className="text-indigo-400" size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Bulk Registration</h1>
          <p className="text-slate-400 text-xs">Upload an Excel sheet or CSV file to register hundreds of student records instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side File Selector & Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-10 rounded-3xl border-2 border-dashed border-[#262c3a] flex flex-col items-center justify-center text-center bg-slate-900/20 relative">
            <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-5 border border-indigo-500/20 shadow-inner">
              <Upload size={36} />
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2 max-w-xs truncate px-4">
              {file ? file.name : 'Select registration spreadsheet'}
            </h3>
            
            <p className="text-slate-400 text-xs mb-6 max-w-sm">
              Supports .xlsx, .xls, and .csv files. Please make sure the layout headers match the instructions on the right.
            </p>
            
            <input 
              type="file" 
              id="bulk-file-upload" 
              className="hidden" 
              onChange={handleFileChange}
              accept=".xlsx,.xls,.csv"
            />
            
            <div className="flex gap-3 justify-center w-full max-w-xs">
              <label htmlFor="bulk-file-upload" className="btn btn-secondary py-3 text-xs font-bold flex-1 justify-center">
                Browse Files
              </label>
              
              <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className="btn btn-primary py-3 text-xs font-bold flex-1 justify-center shadow-lg shadow-indigo-500/10"
              >
                {loading ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={12} className="animate-spin" /> Uploading...
                  </span>
                ) : (
                  'Upload Sheet'
                )}
              </button>
            </div>
          </div>

          {/* Results section */}
          {results && (
            <div className="glass rounded-3xl border border-[#262c3a] overflow-hidden fade-in bg-slate-900/30">
              <div className="p-5 border-b border-[#262c3a]/60 bg-indigo-500/5">
                <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                  <CheckCircle2 size={16} /> Batch Operations Complete
                </h3>
              </div>
              
              <div className="grid grid-cols-3 divide-x divide-[#262c3a] border-b border-[#262c3a]/60">
                <div className="p-5 text-center">
                  <div className="text-3xl font-extrabold text-emerald-400">{results.successCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Succeeded</div>
                </div>
                <div className="p-5 text-center">
                  <div className="text-3xl font-extrabold text-amber-400">{results.skippedCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Skipped</div>
                </div>
                <div className="p-5 text-center">
                  <div className="text-3xl font-extrabold text-rose-400">{results.failedCount}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">Failed</div>
                </div>
              </div>

              {results.failed?.length > 0 && (
                <div className="p-5 bg-rose-500/5">
                  <h4 className="text-xs font-bold text-rose-400 mb-3 flex items-center gap-2">
                    <XCircle size={14} /> Batch Errors Details
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {results.failed.map((fail, i) => (
                      <div key={i} className="text-xs text-rose-300 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20 font-mono">
                        <strong>Row {fail.row}:</strong> {fail.reason}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Side instructions */}
        <div className="space-y-6">
          <div className="glass p-6 rounded-3xl border border-[#262c3a] space-y-4">
            <h4 className="text-white font-bold text-sm flex items-center gap-2 border-b border-[#262c3a]/40 pb-2.5">
              <Info size={16} className="text-indigo-400" /> Excel Schema Layout
            </h4>
            <div className="space-y-4 text-xs text-slate-400 leading-relaxed">
              <p>Your spreadsheet MUST strictly match the following headers (case sensitive):</p>
              <div className="bg-slate-900 border border-[#262c3a] p-3 rounded-xl space-y-1.5 font-mono text-[10px] text-slate-200">
                <div className="flex justify-between border-b border-[#262c3a]/40 pb-1">
                  <span className="text-indigo-400 font-bold">Header name</span>
                  <span className="text-slate-500">Mapping Description</span>
                </div>
                <div className="flex justify-between"><span>studentId</span> <span className="text-slate-500">Student ID Code</span></div>
                <div className="flex justify-between"><span>username</span> <span className="text-slate-500">Login username</span></div>
                <div className="flex justify-between"><span>password</span> <span className="text-slate-500">Access password</span></div>
                <div className="flex justify-between"><span>fullName</span> <span className="text-slate-500">Complete name</span></div>
                <div className="flex justify-between"><span>faculty</span> <span className="text-slate-500">Faculty division</span></div>
                <div className="flex justify-between"><span>department</span> <span className="text-slate-500">Academic dept</span></div>
                <div className="flex justify-between"><span>year</span> <span className="text-slate-500">Freshman / Senior</span></div>
              </div>
              <div className="pt-2 border-t border-[#262c3a]/40 text-[11px] text-indigo-400 flex items-start gap-1">
                <span>⚡</span>
                <p>Duplicate student IDs will be gracefully skipped during import operation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .divide-x > * + * { border-left: 1px solid rgba(38, 44, 58, 0.6); }
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

export default BulkRegisterPage;
