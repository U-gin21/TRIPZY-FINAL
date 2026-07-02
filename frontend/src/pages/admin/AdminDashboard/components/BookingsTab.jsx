import React, { useState } from 'react';

export default function BookingsTab({ bookings }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.ref_no.toLowerCase().includes(term) ||
      b.name_of_institute.toLowerCase().includes(term) ||
      b.service_type.toLowerCase().includes(term) ||
      b.tourist_name.toLowerCase().includes(term) ||
      b.provider_name.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Monitor System Bookings</h2>
          <p className="text-muted small mb-0">Search and track all active and historical bookings across the system</p>
        </div>
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
            Total Matches: {filteredBookings.length}
          </span>
        </div>
      </div>

      <div className="card glass-card border-0 p-4 shadow-lg mb-4">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted">Search Booking</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by reference no, service name, tourist client, provider, type or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          {filteredBookings.length > 0 ? (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ref No</th>
                  <th>Service Name</th>
                  <th>Type</th>
                  <th>Tourist Client</th>
                  <th>Service Provider</th>
                  <th>Pricing</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(b => (
                  <tr key={b.id}>
                    <td><strong className="text-primary">{b.ref_no}</strong></td>
                    <td>{b.name_of_institute}</td>
                    <td className="text-capitalize">{b.service_type}</td>
                    <td>{b.tourist_name}</td>
                    <td>{b.provider_name}</td>
                    <td>LKR {Number(b.price).toLocaleString()}</td>
                    <td>
                      <span className={`badge-${b.status}`}>
                        {b.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-search-heart text-muted fs-1"></i>
              <p className="mt-3 text-muted mb-0">No bookings matching your search criteria were found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
