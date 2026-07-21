import React, { useState } from 'react';

export default function InquiriesTab({ inquiries }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  const filteredInquiries = inquiries.filter(inq => {
    const term = searchTerm.toLowerCase();
    return (
      inq.name.toLowerCase().includes(term) ||
      inq.email.toLowerCase().includes(term) ||
      inq.subject.toLowerCase().includes(term) ||
      inq.message.toLowerCase().includes(term)
    );
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Contact Inquiries</h2>
          <p className="text-muted small mb-0">Monitor and respond to support messages, questions, and inquiries sent via the Contact Us page</p>
        </div>
        <div>
          <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 fw-bold">
            Total Inquiries: {filteredInquiries.length}
          </span>
        </div>
      </div>

      <div className="card glass-card border-0 p-4 shadow-lg mb-4">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="form-label small fw-bold text-muted">Search Message</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by sender name, email, subject or message text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          {filteredInquiries.length > 0 ? (
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Date & Time</th>
                  <th>Sender Info</th>
                  <th>Subject</th>
                  <th>Message Preview</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInquiries.map(inq => (
                  <tr key={inq.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedInquiry(inq)}>
                    <td>
                      <span className="small text-muted">
                        {new Date(inq.created_at).toLocaleDateString()} at{' '}
                        {new Date(inq.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{inq.name}</div>
                      <span className="small text-muted">{inq.email}</span>
                    </td>
                    <td>
                      <strong className="text-emerald">{inq.subject}</strong>
                    </td>
                    <td>
                      <p className="mb-0 text-muted small text-truncate" style={{ maxWidth: '280px' }}>
                        {inq.message}
                      </p>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-gradient rounded-pill px-3"
                        data-bs-toggle="modal"
                        data-bs-target="#adminInquiryModal"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInquiry(inq);
                        }}
                      >
                        <i className="bi bi-eye me-1"></i> View Message
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-envelope-paper text-muted fs-1"></i>
              <p className="mt-3 text-muted mb-0">No contact inquiries found matching your search.</p>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="modal fade show d-block bg-dark bg-opacity-40" id="adminInquiryModal" tabIndex="-1" role="dialog" style={{ backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered modal-md" role="document">
            <div className="modal-content rounded-4 border-0 shadow-lg bg-white text-dark">
              <div className="modal-header border-0 pb-0">
                <h4 className="modal-title fw-bold text-gradient">Contact Inquiry Detail</h4>
                <button type="button" className="btn-close" onClick={() => setSelectedInquiry(null)} aria-label="Close"></button>
              </div>
              <div className="modal-body p-4 text-start">
                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="row g-2">
                    <div className="col-12">
                      <span className="small text-muted d-block">Sender Name:</span>
                      <strong className="text-dark">{selectedInquiry.name}</strong>
                    </div>
                    <div className="col-12 border-top pt-2 mt-2">
                      <span className="small text-muted d-block">Email Address:</span>
                      <a href={`mailto:${selectedInquiry.email}`} className="text-emerald fw-bold text-break small">
                        {selectedInquiry.email}
                      </a>
                    </div>
                    <div className="col-12 border-top pt-2 mt-2">
                      <span className="small text-muted d-block">Subject:</span>
                      <strong className="text-dark">{selectedInquiry.subject}</strong>
                    </div>
                    <div className="col-12 border-top pt-2 mt-2">
                      <span className="small text-muted d-block">Received Date & Time:</span>
                      <span className="small text-muted">
                        {new Date(selectedInquiry.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold mb-2">Message:</h6>
                <div className="p-3 border rounded-3 bg-white" style={{ maxHeight: '200px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: '1.6' }}>
                  {selectedInquiry.message}
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <a href={`mailto:${selectedInquiry.email}?subject=Re: ${selectedInquiry.subject}`} className="btn btn-gradient rounded-pill px-4 me-2">
                  <i className="bi bi-reply-fill me-1"></i> Reply via Email
                </a>
                <button type="button" className="btn btn-light rounded-pill px-4" onClick={() => setSelectedInquiry(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
