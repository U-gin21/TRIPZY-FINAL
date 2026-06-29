import React from 'react';

export default function ReviewModal({ 
  rating, 
  setRating, 
  comment, 
  setComment, 
  handleReviewSubmit 
}) {
  return (
    <div className="modal fade" id="addReviewModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0">
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title fw-bold text-gradient">Feedback & Rating System</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleReviewSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold">Provide Rating</label>
                <select className="form-select rounded-3" value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  <option value="5">★★★★★ (5 - Excellent)</option>
                  <option value="4">★★★★☆ (4 - Very Good)</option>
                  <option value="3">★★★☆☆ (3 - Average)</option>
                  <option value="2">★★☆☆☆ (2 - Poor)</option>
                  <option value="1">★☆☆☆☆ (1 - Horrible)</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Your Review Feedback</label>
                <textarea 
                  className="form-control rounded-3" 
                  rows="4" 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  required 
                  placeholder="Tell us about your experience with this service provider..."
                ></textarea>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
              <button type="submit" className="btn btn-gradient rounded-pill px-4">Submit Feedback</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
