import React, { useState, useEffect } from 'react';

const AdminOffersManagement = () => {
  const [offers, setOffers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const API_URL = 'http://localhost:3006/api/offers';

  const [formData, setFormData] = useState({
    title: '',
    code: '',
    type: 'percent',
    value: '',
    appliesTo: '',
    minOrder: '',
    usageLimit: '0',
    perUserLimit: '1',
    startAt: '',
    endAt: '',
    active: true,
    notes: ''
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const getCounts = () => {
    const now = new Date();
    const active = offers.filter(o => o.active && new Date(o.startAt) <= now && new Date(o.endAt) >= now);
    const upcoming = offers.filter(o => new Date(o.startAt) > now);
    const expired = offers.filter(o => new Date(o.endAt) < now);
    return { active: active.length, upcoming: upcoming.length, expired: expired.length };
  };

  const openModal = (offer = null) => {
    if (offer) {
      setEditingOffer(offer);
      setFormData({
        title: offer.title,
        code: offer.code || '',
        type: offer.type,
        value: offer.value,
        appliesTo: offer.appliesTo || '',
        minOrder: offer.minOrder || '',
        usageLimit: offer.usageLimit || '0',
        perUserLimit: offer.perUserLimit || '1',
        startAt: new Date(offer.startAt).toISOString().slice(0, 16),
        endAt: new Date(offer.endAt).toISOString().slice(0, 16),
        active: offer.active,
        notes: offer.notes || ''
      });
    } else {
      setEditingOffer(null);
      setFormData({
        title: '',
        code: '',
        type: 'percent',
        value: '',
        appliesTo: '',
        minOrder: '',
        usageLimit: '0',
        perUserLimit: '1',
        startAt: '',
        endAt: '',
        active: true,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingOffer(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      value: Number(formData.value) || 0,
      minOrder: Number(formData.minOrder) || 0,
      usageLimit: Number(formData.usageLimit) || 0,
      perUserLimit: Number(formData.perUserLimit) || 1,
      startAt: formData.startAt ? new Date(formData.startAt).toISOString() : new Date().toISOString(),
      endAt: formData.endAt ? new Date(formData.endAt).toISOString() : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: editingOffer ? (editingOffer.usageCount || 0) : 0
    };

    const url = editingOffer ? `${API_URL}/${editingOffer._id}` : API_URL;
    const method = editingOffer ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      closeModal();
      fetchOffers();
    } catch (error) {
      console.error('Error saving offer:', error);
    }
  };

  const toggleOfferStatus = async (offer) => {
    try {
      await fetch(`${API_URL}/${offer._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !offer.active })
      });
      fetchOffers();
    } catch (error) {
      console.error('Error toggling offer:', error);
    }
  };

  const deleteOffer = async (id) => {
    if (window.confirm('Delete offer?')) {
      try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        fetchOffers();
      } catch (error) {
        console.error('Error deleting offer:', error);
      }
    }
  };

  const getTypeLabel = (offer) => {
    if (offer.type === 'percent') return `${offer.value}% off`;
    if (offer.type === 'flat') return `₹${offer.value} off`;
    if (offer.type === 'bogo') return 'BOGO';
    return 'Free Shipping';
  };

  const filteredOffers = offers.filter(offer => {
    const q = searchQuery.toLowerCase();
    return (offer.code?.toLowerCase().includes(q) || offer.title.toLowerCase().includes(q));
  });

  const counts = getCounts();

  return (
    <div style={styles.body}>
      <style>{globalStyles}</style>
      
      <header style={styles.header}>
        <div style={styles.headerContainer}>
          <div>
            <h1 style={styles.headerTitle}>Special Offers</h1>
            <p style={styles.headerSubtitle}>Create coupons, flash sales, BOGO & free-shipping rules</p>
          </div>
          <div style={styles.headerButtons}>
            <button onClick={() => openModal()} style={styles.btnPrimary}>+ New Offer</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Offers</div>
            <div style={styles.statValue}>{counts.active}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Upcoming</div>
            <div style={styles.statValue}>{counts.upcoming}</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Expired</div>
            <div style={styles.statValue}>{counts.expired}</div>
          </div>
        </section>

        <section style={styles.tableSection}>
          <div style={styles.tableHeader}>
            <h2 style={styles.tableTitle}>Offers List</h2>
            <input
              placeholder="Search code or title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={styles.th}>Code/Title</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Rules</th>
                  <th style={styles.th}>Validity</th>
                  <th style={styles.th}>Usage</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.map(offer => (
                  <tr key={offer._id}>
                    <td style={styles.td}>
                      <div style={styles.tdBold}>{offer.code || '—'}</div>
                      <div style={styles.tdMuted}>{offer.title}</div>
                    </td>
                    <td style={styles.td}>{getTypeLabel(offer)}</td>
                    <td style={styles.td}>{offer.appliesTo || 'All'}</td>
                    <td style={styles.td}>
                      {new Date(offer.startAt || Date.now()).toLocaleString()} — {new Date(offer.endAt || Date.now()).toLocaleString()}
                    </td>
                    <td style={styles.td}>{offer.usageCount || 0}/{offer.usageLimit || '∞'}</td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <div style={styles.actionButtons}>
                        <button onClick={() => openModal(offer)} style={styles.btnGhost}>Edit</button>
                        <button onClick={() => toggleOfferStatus(offer)} style={styles.btnGhost}>
                          {offer.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteOffer(offer._id)} style={styles.btnDanger}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {showModal && (
        <div style={styles.modal} onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>{editingOffer ? 'Edit Offer' : 'New Offer'}</h3>
              <button onClick={closeModal} style={styles.closeButton}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
              <label style={styles.label}>
                <span style={styles.labelText}>Offer Title</span>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={styles.input}
                  required
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Coupon Code (optional)</span>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Type</span>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={styles.input}
                >
                  <option value="percent">% Discount</option>
                  <option value="flat">Flat Discount</option>
                  <option value="bogo">Buy X Get Y</option>
                  <option value="free_shipping">Free Shipping</option>
                </select>
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Value</span>
                <input
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  style={styles.input}
                  placeholder="10 for 10% or 500 for ₹500"
                />
              </label>
              <label style={{ ...styles.label, gridColumn: '1 / -1' }}>
                <span style={styles.labelText}>Applies To (categories or product IDs comma-separated)</span>
                <input
                  value={formData.appliesTo}
                  onChange={(e) => setFormData({ ...formData, appliesTo: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Min Order Value (optional)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.minOrder}
                  onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Usage Limit (total)</span>
                <input
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Per-user Limit</span>
                <input
                  type="number"
                  min="0"
                  value={formData.perUserLimit}
                  onChange={(e) => setFormData({ ...formData, perUserLimit: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>Start Date & Time</span>
                <input
                  type="datetime-local"
                  value={formData.startAt}
                  onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.label}>
                <span style={styles.labelText}>End Date & Time</span>
                <input
                  type="datetime-local"
                  value={formData.endAt}
                  onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                  style={styles.input}
                />
              </label>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  style={styles.checkbox}
                />
                <span style={styles.labelText}>Active</span>
              </label>
              <label style={{ ...styles.label, gridColumn: '1 / -1' }}>
                <span style={styles.labelText}>Notes / Description</span>
                <textarea
                  rows="2"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  style={styles.textarea}
                />
              </label>
              <div style={styles.formButtons}>
                <button type="button" onClick={closeModal} style={styles.btnGhost}>Cancel</button>
                <button type="submit" style={styles.btnPrimary}>Save Offer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const styles = {
  body: {
    fontFamily: 'Inter, system-ui, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
    background: 'linear-gradient(180deg, #0b1020, #0d1226)',
    color: '#e6eef8',
    minHeight: '100vh'
  },
  header: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 10px 30px rgba(2,6,23,0.45)',
    position: 'sticky',
    top: 0,
    padding: '12px',
    zIndex: 30
  },
  headerContainer: {
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: '4px'
  },
  headerSubtitle: {
    fontSize: '0.875rem',
    color: '#94a3b8'
  },
  headerButtons: {
    display: 'flex',
    gap: '8px'
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '16px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '16px'
  },
  statCard: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 10px 30px rgba(2,6,23,0.45)',
    padding: '16px',
    borderRadius: '12px'
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: '0.875rem'
  },
  statValue: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginTop: '8px'
  },
  tableSection: {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
    border: '1px solid rgba(255,255,255,0.06)',
    boxShadow: '0 10px 30px rgba(2,6,23,0.45)',
    padding: '16px',
    borderRadius: '12px'
  },
  tableHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  tableTitle: {
    fontWeight: 'bold'
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '8px 12px',
    borderRadius: '12px',
    border: 'none',
    color: '#e6eef8'
  },
  tableContainer: {
    overflowX: 'auto',
    maxHeight: '420px'
  },
  table: {
    width: '100%',
    fontSize: '0.875rem'
  },
  tableHeaderRow: {
    color: '#94a3b8',
    fontSize: '0.75rem'
  },
  th: {
    padding: '8px',
    textAlign: 'left'
  },
  td: {
    padding: '8px'
  },
  tdBold: {
    fontWeight: '600'
  },
  tdMuted: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  actionButtons: {
    display: 'inline-flex',
    gap: '8px'
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    padding: '8px 14px',
    fontWeight: '600',
    background: '#6366f1',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    padding: '8px 14px',
    fontWeight: '600',
    background: 'rgba(255,255,255,0.04)',
    color: '#e6eef8',
    border: 'none',
    cursor: 'pointer'
  },
  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '12px',
    padding: '8px 14px',
    fontWeight: '600',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    cursor: 'pointer'
  },
  modal: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(2,6,23,0.6)',
    zIndex: 50
  },
  modalContent: {
    background: '#0f162e',
    padding: '16px',
    borderRadius: '12px',
    maxWidth: '768px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  modalTitle: {
    fontWeight: 'bold'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#e6eef8',
    cursor: 'pointer',
    fontSize: '1.25rem'
  },
  form: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  label: {
    display: 'grid',
    gap: '4px'
  },
  labelText: {
    fontSize: '0.75rem',
    color: '#94a3b8'
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '8px 12px',
    borderRadius: '12px',
    border: 'none',
    color: '#e6eef8'
  },
  textarea: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: '8px 12px',
    borderRadius: '12px',
    border: 'none',
    color: '#e6eef8',
    fontFamily: 'inherit'
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    gridColumn: '1 / -1'
  },
  checkbox: {
    accentColor: '#6366f1'
  },
  formButtons: {
    gridColumn: '1 / -1',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    paddingTop: '8px'
  }
};

export default AdminOffersManagement;