import React, { useState } from 'react';
import { apiRequest, getUploadUrl } from '../../../../api';

export default function ListingsTab({ listings, fetchListings, showConfirm }) {
  // Edit Service Form State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditInit = (srv) => {
    setEditingId(srv.id);
    setEditName(srv.name_of_institute);
    setEditPrice(srv.price);
    setEditDesc(srv.description);
  };

  const handleUpdateServiceSubmit = async (e) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await apiRequest('services', 'update', 'POST', {
        id: editingId,
        name_of_institute: editName,
        price: editPrice,
        description: editDesc
      });
      alert("Listing updated successfully.");
      setEditingId(null);
      fetchListings();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      await apiRequest('services', 'toggle_status', 'POST', { id, status: nextStatus });
      fetchListings();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteListing = (id) => {
    showConfirm(
      "Are you sure you want to permanently delete this listing?",
      async () => {
        try {
          await apiRequest('services', 'delete', 'POST', { id });
          alert("Listing deleted successfully.");
          fetchListings();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Listing"
    );
  };

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">My Service Listings</h2>
      {editingId && (
        <div className="card glass-card p-4 border-0 mb-4 animate-fade-in">
          <h5 className="fw-bold text-primary mb-3">Edit Offer Post</h5>
          <form onSubmit={handleUpdateServiceSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold">Name of Institute</label>
                <input type="text" className="form-control rounded-3" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold">Price / Day (LKR)</label>
                <input type="number" className="form-control rounded-3" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
              </div>
              <div className="col-12">
                <label className="form-label small fw-bold">Description</label>
                <textarea className="form-control rounded-3" rows="3" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} required></textarea>
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-gradient btn-sm rounded-pill px-4 me-2" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button type="button" className="btn btn-light btn-sm rounded-pill px-4" onClick={() => setEditingId(null)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {listings.length > 0 ? (
        <div className="row g-4">
          {listings.map(srv => (
            <div className="col-md-6 col-lg-4" key={srv.id}>
              <div className="card glass-card h-100 border-0 overflow-hidden d-flex flex-column justify-content-between">
                <img 
                  src={getUploadUrl(srv.photo) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
                  alt={srv.name_of_institute} 
                  style={{ height: '200px', objectFit: 'cover', width: '100%' }}
                />
                <div className="p-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="badge bg-secondary bg-opacity-10 text-dark text-capitalize">{srv.service_type}</span>
                    <span className={`badge ${srv.status === 'enabled' ? 'bg-success' : 'bg-danger'} text-white`}>
                      {srv.status === 'enabled' ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                  <h5 className="fw-bold mb-2">{srv.name_of_institute}</h5>
                  <p className="text-muted small line-clamp-3 mb-3">{srv.description}</p>
                  <div className="mb-3 small">
                    <span className="fw-bold d-block">Contact Info:</span>
                    <span className="text-muted">{srv.contact_no} | {srv.email}</span>
                    <span className="d-block fw-bold text-success mt-2">LKR {Number(srv.price).toLocaleString()} / day</span>
                  </div>
                </div>

                <div className="px-4 pb-4 pt-3 border-top mt-auto d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => handleEditInit(srv)}>
                    <i className="bi bi-pencil-square"></i> Edit
                  </button>
                  <button 
                    className={`btn btn-${srv.status === 'enabled' ? 'outline-warning' : 'warning'} btn-sm flex-fill`}
                    onClick={() => handleToggleStatus(srv.id, srv.status)}
                  >
                    {srv.status === 'enabled' ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteListing(srv.id)}>
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-card-list fs-1 text-muted"></i>
          <h5 className="fw-bold mt-3">You Haven't Offered Any Services Yet</h5>
          <p className="text-muted">Click the 'Create Offer Listing' tab to list your hotel, vehicle, guide, or camping gear services.</p>
        </div>
      )}
    </div>
  );
}
