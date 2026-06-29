import React from 'react';

export default function BookServiceModal({ 
  selectedService, 
  startDate, 
  endDate, 
  bookingDetails, 
  setBookingDetails, 
  bookingSubmitting, 
  handleCreateBooking, 
  startDateRef, 
  endDateRef 
}) {
  return (
    <div className="modal fade" id="bookServiceModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        {selectedService && (
          <div className="modal-content rounded-4 border-0">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">Create Service Booking Request</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleCreateBooking}>
              <div className="modal-body p-4">
                <div className="bg-light p-3 rounded-3 mb-3">
                  <span className="small text-muted d-block">Booking Service:</span>
                  <strong className="text-dark">{selectedService.name_of_institute}</strong>
                  <span className="d-block text-success fw-bold">LKR {Number(selectedService.price).toLocaleString()} / day</span>
                </div>

                <div className="row">
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">Start Date</label>
                    <input 
                      type="text" 
                      ref={startDateRef}
                      className="form-control rounded-3 bg-white" 
                      value={startDate} 
                      placeholder="Select Start Date"
                      readOnly
                      required 
                    />
                  </div>
                  <div className="col-6 mb-3">
                    <label className="form-label small fw-bold">End Date</label>
                    <input 
                      type="text" 
                      ref={endDateRef}
                      className="form-control rounded-3 bg-white" 
                      value={endDate} 
                      placeholder="Select End Date"
                      readOnly
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Special Requests / Requirements</label>
                  <textarea 
                    className="form-control rounded-3" 
                    rows="3" 
                    value={bookingDetails} 
                    onChange={(e) => setBookingDetails(e.target.value)}
                    placeholder="e.g. Flight arrival time, twin bed requests, dietary parameters..."
                  ></textarea>
                </div>

                <div className="alert alert-info py-2 small mb-0" role="alert">
                  <i className="bi bi-info-circle-fill me-1"></i> Tripzy operates **offline cash payments**. You pay physically to the provider.
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={bookingSubmitting}>
                  {bookingSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
