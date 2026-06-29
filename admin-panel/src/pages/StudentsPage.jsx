import React, { useState, useEffect } from 'react';
import { getAllUsers, approveUser as approveUserApi } from '../api';
import { UserCheck, Search, Filter, Mail, User as UserIcon } from 'lucide-react';

const StudentsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await approveUserApi(userId);
      // Refresh list
      fetchUsers();
    } catch (err) {
      alert('Failed to approve user: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    (user.fullName && user.fullName.toLowerCase().includes(search.toLowerCase())) ||
    (user.studentId && user.studentId.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
          <p className="text-slate-400">Review and approve student accounts.</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text"
            placeholder="Search by name, ID, or username..."
            className="w-full bg-slate-900 border border-[#262c3a] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="glass rounded-2xl border border-[#262c3a] overflow-hidden">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student info</th>
                <th>Student ID</th>
                <th>Faculty / Dept</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center text-indigo-400">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <div className="font-bold text-white">{user.fullName || user.username}</div>
                        <div className="text-xs text-slate-500">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="font-mono text-sm">{user.studentId || 'N/A'}</span>
                  </td>
                  <td>
                    <div className="text-sm">{user.faculty || 'N/A'}</div>
                    <div className="text-xs text-slate-500">{user.department || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.isApproved 
                        ? 'bg-emerald-500/10 text-emerald-500' 
                        : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {user.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td>
                    {!user.isApproved && (
                      <button 
                        onClick={() => handleApprove(user._id)}
                        className="btn btn-primary px-3 py-1.5 text-xs"
                      >
                        <UserCheck size={14} /> Approve
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="text-slate-500 mb-2 font-medium">No students found</div>
                    <div className="text-xs text-slate-600">Try adjusting your search criteria</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .bg-slate-900 { background-color: #0f172a; }
        .bg-amber-500\\/10 { background-color: rgba(245, 158, 11, 0.1); }
        .text-amber-500 { color: #f59e0b; }
        .pl-12 { padding-left: 3rem; }
        .text-center { text-align: center; }
        .py-12 { padding-top: 3rem; padding-bottom: 3rem; }
      `}} />
    </div>
  );
};

export default StudentsPage;
