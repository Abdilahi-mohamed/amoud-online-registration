import React, { useState, useEffect, useMemo } from 'react';
import { getAllPayments } from '../api';
import { CreditCard, Search, RefreshCw, Phone, Calendar } from 'lucide-react';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const loadPayments = async () => {
    setLoading(true);
    try {
      const res = await getAllPayments();
      const rows = (res.data || []).filter(
        (p) => p.status === 'paid' || !p.status
      );
      setPayments(rows);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        (p.studentName || p.user?.username || '').toString().toLowerCase().includes(q) ||
        (p.studentId || '').toString().toLowerCase().includes(q) ||
        (p.phone || '').toString().toLowerCase().includes(q)
    );
  }, [payments, search]);

  const renderRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={5}>
            <div className="payments-loading">
              <RefreshCw size={32} className="spin" />
              <div>Loading payment records...</div>
            </div>
          </td>
        </tr>
      );
    }

    if (filtered.length === 0) {
      return (
        <tr>
          <td colSpan={5}>
            <div className="payments-empty">
              <div className="payments-empty-icon">
                <CreditCard size={28} />
              </div>
              <h3>No payments found</h3>
              <p>
                {search.trim()
                  ? 'Try a different search term.'
                  : 'Student payments from the frontend will appear here once completed.'}
              </p>
            </div>
          </td>
        </tr>
      );
    }

    return filtered.map((p) => {
      const name = p.studentName || p.user?.username || 'Unknown';
      const initial = (name[0] || 'U').toUpperCase();

      return (
        <tr key={p._id}>
          <td>
            <div className="payments-student-cell">
              <div className="payments-avatar">{initial}</div>
              <span className="payments-student-name">{name}</span>
            </div>
          </td>
          <td>
            <span className="payments-cell-mono">{p.studentId || '—'}</span>
          </td>
          <td>
            <span className="payments-cell-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Phone size={14} style={{ color: '#9ca3af', flexShrink: 0 }} />
              {p.phone || '—'}
            </span>
          </td>
          <td>
            <span className="payments-amount">${Number(p.amount || 0).toFixed(2)}</span>
          </td>
          <td>
            <span className="payments-date-cell">
              <Calendar size={14} />
              {formatDate(p.createdAt || p.date)}
            </span>
          </td>
        </tr>
      );
    });
  };

  const renderMobileCards = () => {
    if (loading) {
      return (
        <div className="payments-loading">
          <RefreshCw size={28} className="spin" />
          <div>Loading...</div>
        </div>
      );
    }

    if (filtered.length === 0) {
      return (
        <div className="payments-empty">
          <div className="payments-empty-icon">
            <CreditCard size={24} />
          </div>
          <h3>No payments found</h3>
          <p>{search.trim() ? 'Try a different search.' : 'No frontend payments yet.'}</p>
        </div>
      );
    }

    return filtered.map((p) => {
      const name = p.studentName || p.user?.username || 'Unknown';
      const initial = (name[0] || 'U').toUpperCase();

      return (
        <article key={p._id} className="payments-mobile-card">
          <div className="payments-mobile-card-top">
            <div className="payments-avatar">{initial}</div>
            <div>
              <div className="payments-student-name">{name}</div>
              <div className="payments-cell-mono" style={{ marginTop: '0.15rem' }}>
                {p.studentId || '—'}
              </div>
            </div>
            <span className="payments-amount" style={{ marginLeft: 'auto' }}>
              ${Number(p.amount || 0).toFixed(2)}
            </span>
          </div>
          <div className="payments-mobile-row">
            <label>Phone</label>
            <span>{p.phone || '—'}</span>
          </div>
          <div className="payments-mobile-row">
            <label>Payment date</label>
            <span>{formatDate(p.createdAt || p.date)}</span>
          </div>
        </article>
      );
    });
  };

  return (
    <div className="payments-page">
      <section className="payments-hero">
        <div className="payments-hero-left">
          <div className="payments-hero-icon">
            <CreditCard size={22} />
          </div>
          <div>
            <h1>Student Payment History</h1>
            <p>Completed payments made through the frontend payment system.</p>
          </div>
        </div>

        <div className="payments-toolbar">
          <div className="payments-search-wrap">
            <Search size={16} />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID or phone..."
              className="payments-search-input"
              aria-label="Search payments"
            />
          </div>
          <button
            type="button"
            onClick={loadPayments}
            disabled={loading}
            className="payments-refresh-btn"
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
            Refresh
          </button>
        </div>
      </section>

      <section className="payments-table-card">
        <div className="payments-table-header">
          <div>
            <h2>Frontend Payment Records</h2>
            <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="payments-table-wrap">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Phone Number</th>
                <th>Amount Paid</th>
                <th>Payment Time/Date</th>
              </tr>
            </thead>
            <tbody>{renderRows()}</tbody>
          </table>
        </div>

        <div className="payments-mobile-list">{renderMobileCards()}</div>

        <div className="payments-table-footer">
          Showing {filtered.length} of {payments.length} completed payment
          {payments.length !== 1 ? 's' : ''}
        </div>
      </section>
    </div>
  );
};

export default PaymentsPage;
