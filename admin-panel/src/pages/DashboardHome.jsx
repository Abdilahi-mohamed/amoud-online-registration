import React, { useState, useEffect } from 'react';
import { getAdminDashboard } from '../api';
import { Users, FileText, CreditCard, CheckCircle, Clock } from 'lucide-react';

const DashboardHome = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getAdminDashboard();
        setData(response.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Students', value: data?.stats?.totalUsers || 0, icon: <Users />, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Registrations', value: data?.stats?.totalRegistrations || 0, icon: <FileText />, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { name: 'Total Payments', value: data?.stats?.totalPayments || 0, icon: <CreditCard />, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-slate-400">Welcome to the university management portal.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="stat-card glass p-6 rounded-2xl border border-[#262c3a]">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-slate-400">{stat.name}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="glass rounded-2xl border border-[#262c3a] overflow-hidden">
          <div className="p-6 border-b border-[#262c3a] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Registrations</h3>
            <Clock size={18} className="text-slate-400" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentRegistrations?.slice(0, 5).map((reg) => (
                  <tr key={reg._id}>
                    <td>{reg.user?.username || 'Unknown'}</td>
                    <td>{reg.department}</td>
                    <td>{reg.semester}</td>
                  </tr>
                ))}
                {!data?.recentRegistrations?.length && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-slate-500">No recent registrations</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="glass rounded-2xl border border-[#262c3a] overflow-hidden">
          <div className="p-6 border-b border-[#262c3a] flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Payments</h3>
            <CheckCircle size={18} className="text-emerald-500" />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data?.recentPayments?.slice(0, 5).map((pay) => (
                  <tr key={pay._id}>
                    <td className="font-mono text-xs">{pay.paymentNumber}</td>
                    <td className="font-bold">${pay.amount}</td>
                    <td>
                      <span className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                        {pay.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!data?.recentPayments?.length && (
                  <tr>
                    <td colSpan="3" className="text-center py-8 text-slate-500">No recent payments</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .grid { display: grid; }
        .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-6 { gap: 1.5rem; }
        .gap-8 { gap: 2rem; }
        .space-y-8 > * + * { margin-top: 2rem; }
        .stat-card {
          transition: transform 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .text-blue-500 { color: #3b82f6; }
        .bg-blue-500\\/10 { background-color: rgba(59, 130, 246, 0.1); }
        .text-emerald-500 { color: #10b981; }
        .bg-emerald-500\\/10 { background-color: rgba(16, 185, 129, 0.1); }
        .font-mono { font-family: monospace; }
        .uppercase { text-transform: uppercase; }
        .tracking-wider { letter-spacing: 0.05em; }
      `}} />
    </div>
  );
};

export default DashboardHome;
