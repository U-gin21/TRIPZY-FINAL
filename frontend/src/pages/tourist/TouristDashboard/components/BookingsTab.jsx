import React, { useState } from 'react';

export default function BookingsTab({ bookings, setReviewServiceId }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.ref_no.toLowerCase().includes(term) ||
      b.name_of_institute.toLowerCase().includes(term) ||
      b.service_type.toLowerCase().includes(term) ||
      b.start_date.toLowerCase().includes(term) ||
      b.end_date.toLowerCase().includes(term) ||
      b.status.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">My Bookings History</h2>
          <p className="text-muted small mb-0">Search and check the status of your reservation requests</p>
        </div>
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
            Total Bookings: {filteredBookings.length}
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
              placeholder="Search by reference no, service, type, dates or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        {filteredBookings.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ref No</th>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Total Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(book => (
                  <tr key={book.id}>
                    <td><strong className="text-primary">{book.ref_no}</strong></td>
                    <td>{book.name_of_institute}</td>
                    <td className="text-capitalize">{book.service_type}</td>
                    <td>{book.start_date} to {book.end_date}</td>
                    <td>LKR {Number(book.price).toLocaleString()}</td>
                    <td>
                      <span className={`badge-${book.status}`}>
                        {book.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {book.status === 'completed' && (
                        <button 
                          className="btn btn-outline-gradient btn-sm rounded-pill"
                          data-bs-toggle="modal"
                          data-bs-target="#addReviewModal"
                          onClick={() => setReviewServiceId(book.service_id)}
                        >
                          <i className="bi bi-star-fill me-1"></i> Review
                        </button>
                      )}
                      {book.status === 'pending' && (
                        <span className="text-muted small">Awaiting Payment</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-1 text-muted"></i>
            <p className="mt-3 text-muted mb-0">No bookings matching your search criteria were found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
