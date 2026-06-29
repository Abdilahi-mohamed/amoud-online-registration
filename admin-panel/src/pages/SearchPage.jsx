import React, { useState } from 'react';
import { searchStudentById } from '../api';
import { Search, User, CreditCard, FileText, MapPin, Building, Calendar } from 'lucide-react';

const SearchPage = () => {
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!studentId) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await searchStudentById(studentId);
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Student not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Student Search</h1>
        <p className="text-slate-400">Search for detailed student records and history.</p>
      </div>

      <div className="glass p-8 rounded-2xl border border-[#262c3a]">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Enter Student ID (e.g. STU-001)"
              className="w-full bg-slate-900 border border-[#262c3a] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary px-8" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {error && (
        <div className="glass p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-rose-400 text-center fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 fade-in">
          {/* Student Profile Card */}
          <div className="glass p-8 rounded-3xl border border-[#262c3a] flex flex-col md:flex-row gap-8 items-start">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
              <User size={48} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <div className="text-xl font-bold text-white mt-1">{result.user.fullName || 'N/A'}</div>
                <div className="text-sm text-indigo-400">{result.user.username}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
                <div className="text-lg font-bold text-white mt-1 font-mono">{result.user.studentId || 'N/A'}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty & Dept</label>
                <div className="text-sm font-bold text-white mt-1 flex items-center gap-1"><Building size={14}/> {result.user.faculty || 'N/A'}</div>
                <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><MapPin size={14}/> {result.user.department || 'N/A'}</div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registration Status</label>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    result.user.isApproved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    {result.user.isApproved ? 'Account Approved' : 'Account Pending'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Registrations List */}
            <div className="glass rounded-2xl border border-[#262c3a] overflow-hidden">
              <div className="p-6 border-b border-[#262c3a] flex items-center gap-2">
                <FileText size={20} className="text-indigo-400" />
                <h3 className="text-lg font-bold text-white">Academic History</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Detail</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.registrations.map(reg => (
                      <tr key={reg._id}>
                        <td><span className="text-xs font-bold uppercase text-indigo-400">{reg.type}</span></td>
                        <td>
                          <div className="text-sm">{reg.department}</div>
                          <div className="text-[10px] text-slate-500">Sem {reg.semester} • {reg.class?.name || 'No Class'}</div>
                        </td>
                        <td className="text-xs text-slate-500">{new Date(reg.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {!result.registrations.length && (
                      <tr><td colSpan="3" className="text-center py-10 text-slate-600">No registration history</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments List */}
            <div className="glass rounded-2xl border border-[#262c3a] overflow-hidden">
              <div className="p-6 border-b border-[#262c3a] flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Payment Records</h3>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ref Number</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.payments.map(pay => (
                      <tr key={pay._id}>
                        <td className="font-mono text-xs">{pay.paymentNumber}</td>
                        <td className="font-bold text-emerald-400">${pay.amount}</td>
                        <td className="text-xs text-slate-500">{new Date(pay.date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {!result.payments.length && (
                      <tr><td colSpan="3" className="text-center py-10 text-slate-600">No payment history</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{ __html: `
        .shrink-0 { flex-shrink: 0; }
        .text-rose-400 { color: #fb7185; }
        .bg-rose-500\\/5 { background-color: rgba(244, 63, 94, 0.05); }
        .border-rose-500\\/20 { border-color: rgba(244, 63, 94, 0.2); }
      `}} />
    </div>
  );
};

export default SearchPage;
