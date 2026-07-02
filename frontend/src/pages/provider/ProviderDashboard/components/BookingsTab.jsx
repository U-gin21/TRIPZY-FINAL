import React, { useState } from 'react';
import { apiRequest } from '../../../../api';

export default function BookingsTab({ bookings, setSelectedCust, fetchBookings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [processingBookings, setProcessingBookings] = useState({});

  const handleUpdateBookingStatus = async (id, status) => {
    setProcessingBookings(prev => ({ ...prev, [id]: true }));
    try {
      await apiRequest('bookings', 'update_status', 'POST', { id, status });
      alert(`Booking has been marked as ${status.toUpperCase()} and the tourist has been emailed.`);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingBookings(prev => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const filteredBookings = bookings.filter(b => {
    const term = searchTerm.toLowerCase();
    return (
      b.ref_no.toLowerCase().includes(term) ||
      b.tourist_name.toLowerCase().includes(term) ||
      b.start_date.toLowerCase().includes(term) ||
      b.end_date.toLowerCase().includes(term) ||
      (b.booking_details && b.booking_details.toLowerCase().includes(term)) ||
      b.status.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Incoming Tourist Booking Requests</h2>
          <p className="text-muted small mb-0">Search, manage, and verify status updates for customer bookings</p>
        </div>
        <div>
          <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 fw-bold">
            Pending Requests: {filteredBookings.filter(b => b.status === 'pending').length}
          </span>
        </div>
      </div>

      <div className="card glass-card border-0 p-4 shadow-lg mb-4">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted">Search Request</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by reference no, client name, dates, status or requests..."
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
                  <th>Tourist Client</th>
                  <th>Dates</th>
                  <th>Price Sum</th>
                  <th>Request Details</th>
                  <th>Status</th>
                  <th>Action Buttons</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(book => (
                  <tr key={book.id}>
                    <td><strong className="text-primary">{book.ref_no}</strong></td>
                    <td>
                      <button 
                        className="btn btn-link p-0 text-decoration-none fw-bold text-gradient-hover"
                        data-bs-toggle="modal"
                        data-bs-target="#customerDetailsModal"
                        onClick={() => setSelectedCust(book)}
                        style={{ border: 'none', background: 'none' }}
                      >
                        {book.tourist_name}
                      </button>
                    </td>
                    <td>{book.start_date} to {book.end_date}</td>
                    <td>LKR {Number(book.price).toLocaleString()}</td>
                    <td><span className="small text-muted">{book.booking_details || 'None'}</span></td>
                    <td>
                      <span className={`badge-${book.status}`}>
                        {book.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {book.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button 
                            className="btn btn-success btn-sm rounded-pill px-3 d-flex align-items-center gap-1" 
                            onClick={() => handleUpdateBookingStatus(book.id, 'completed')}
                            disabled={!!processingBookings[book.id]}
                          >
                            {processingBookings[book.id] ? (
                              <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Verifying...
                              </>
                            ) : 'Verify Cash'}
                          </button>
                          <button 
                            className="btn btn-danger btn-sm rounded-pill px-3" 
                            onClick={() => handleUpdateBookingStatus(book.id, 'rejected')}
                            disabled={!!processingBookings[book.id]}
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-5">
            <i className="bi bi-briefcase fs-1 text-muted"></i>
            <p className="mt-3 text-muted mb-0">No booking requests found matching your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
