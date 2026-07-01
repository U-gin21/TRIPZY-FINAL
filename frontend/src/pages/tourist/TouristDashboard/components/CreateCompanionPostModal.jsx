import React from 'react';

export default function CreateCompanionPostModal({
  postDest,
  setPostDest,
  postStartDate,
  setPostStartDate,
  postEndDate,
  setPostEndDate,
  postBudget,
  setPostBudget,
  postCompanionsNeeded,
  setPostCompanionsNeeded,
  postGenderPref,
  setPostGenderPref,
  postInterests,
  setPostInterests,
  postDesc,
  setPostDesc,
  postSubmitting,
  handleCreateCompanionPost
}) {
  return (
    <div className="modal fade" id="createCompanionPostModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content rounded-4 border-0">
          <div className="modal-header border-0 pb-0">
            <h4 className="modal-title fw-bold text-gradient">Create Companion Post</h4>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <form onSubmit={handleCreateCompanionPost}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-bold">Destination / Place</label>
                <input
                  type="text"
                  className="form-control rounded-3"
                  value={postDest}
                  onChange={(e) => setPostDest(e.target.value)}
                  required
                  placeholder="e.g. Nuwara Eliya, Galle, Kandy"
                />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Start Date</label>
                  <input
                    type="date"
                    className="form-control rounded-3"
                    value={postStartDate}
                    onChange={(e) => setPostStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">End Date</label>
                  <input
                    type="date"
                    className="form-control rounded-3"
                    value={postEndDate}
                    onChange={(e) => setPostEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="mb-3 row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Budget Range</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={postBudget}
                    onChange={(e) => setPostBudget(e.target.value)}
                    placeholder="e.g. 15,000 - 25,000"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Companions Needed</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control rounded-3"
                    value={postCompanionsNeeded}
                    onChange={(e) => setPostCompanionsNeeded(Number(e.target.value))}
                    required
                  />
                </div>
              </div>
              <div className="mb-3 row g-3">
                <div className="col-6">
                  <label className="form-label small fw-bold">Gender Preference</label>
                  <select
                    className="form-select rounded-3"
                    value={postGenderPref}
                    onChange={(e) => setPostGenderPref(e.target.value)}
                  >
                    <option>Any</option>
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold">Travel Interests</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    value={postInterests}
                    onChange={(e) => setPostInterests(e.target.value)}
                    placeholder="e.g. hiking, culture, food"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-bold">Additional Details</label>
                <textarea
                  className="form-control rounded-3"
                  rows="4"
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="Describe your travel plan, preferred activities, and what kind of companion you are looking for..."
                />
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" className="btn btn-gradient rounded-pill px-4" disabled={postSubmitting}>
                {postSubmitting ? 'Posting...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
