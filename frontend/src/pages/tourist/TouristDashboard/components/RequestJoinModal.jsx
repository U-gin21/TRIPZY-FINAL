import React from 'react';

export default function RequestJoinModal({
  requestPost,
  requestMsg,
  setRequestMsg,
  requestSubmitting,
  handleSendCompanionRequest
}) {
  return (
    <div className="modal fade" id="requestJoinModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0">
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title fw-bold text-gradient">Request to Join Trip</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleSendCompanionRequest}>
            <div className="modal-body p-4">
              {requestPost ? (
                <>
                  <div className="mb-3">
                    <span className="small text-muted d-block">Trip destination</span>
                    <strong>{requestPost.destination_place}</strong>
                  </div>
                  <div className="mb-3">
                    <span className="small text-muted d-block">Host</span>
                    <strong>{requestPost.full_name}</strong>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Message to Host</label>
                    <textarea
                      className="form-control rounded-3"
                      rows="4"
                      value={requestMsg}
                      onChange={(e) => setRequestMsg(e.target.value)}
                      placeholder="Tell them why you want to join or what kind of travel companion you are..."
                    />
                  </div>
                </>
              ) : (
                <p className="text-muted small">Select a trip to request to join.</p>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={requestSubmitting || !requestPost}>
                {requestSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
