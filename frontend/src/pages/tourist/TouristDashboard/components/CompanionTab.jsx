import React from 'react';
import { getUploadUrl, getProfilePhoto } from '../../../../api';

export default function CompanionTab({
  currentUser,
  companionPosts,
  myPosts,
  myRequests,
  incomingRequests,
  fetchCompanionDetails,
  handleClosePost,
  handleDeletePost,
  handleApproveRequest,
  handleRejectRequest,
  handleCancelRequest,
  setRequestPost,
  setRequestMsg,
  handleOpenRateModal
}) {
  // Helper to determine if a trip has ended
  const isPastTrip = (endDateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    return end < today;
  };

  // Filter Active vs Past
  const activeMyPosts = myPosts.filter(post => post.status === 'open' && !isPastTrip(post.end_date));
  const pastMyPosts = myPosts.filter(post => post.status === 'closed' || isPastTrip(post.end_date));

  // Only show pending incoming requests for active upcoming trips
  const activeIncomingRequests = incomingRequests.filter(req => req.status === 'pending' && !isPastTrip(req.end_date));

  // Only show sent requests for active upcoming trips
  const activeMyRequests = myRequests.filter(req => !isPastTrip(req.end_date));

  // Show accepted sent requests for trips that have ended
  const pastMyRequests = myRequests.filter(req => req.status === 'accepted' && isPastTrip(req.end_date));

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Travel Companion Management</h2>
          <p className="text-muted small mb-0">Create posts, manage requests and share travel plans with other tourists.</p>
        </div>
        <button
          className="btn btn-gradient btn-sm rounded-pill"
          data-bs-toggle="modal"
          data-bs-target="#createCompanionPostModal"
        >
          <i className="bi bi-plus-circle-fill me-1"></i> Create Post
        </button>
      </div>

      <div className="card glass-card border-0 p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold mb-1">Open Companion Posts</h5>
            <p className="text-muted small mb-0">Browse all currently open travel plans from other tourists.</p>
          </div>
          <button className="btn btn-sm btn-outline-gradient" onClick={fetchCompanionDetails}>
            Refresh Feed
          </button>
        </div>
        {companionPosts.length > 0 ? (
          <div className="row g-3">
            {companionPosts.map((post) => (
              <div className="col-md-6 col-lg-4" key={post.id}>
                <div className="card glass-card border-0 p-3 h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="fw-bold mb-0">{post.destination_place}</h6>
                    {post.trip_rating_count > 0 && (
                      <span className="badge bg-warning text-dark px-2 py-1 rounded">
                        ★ {post.trip_rating}/10
                      </span>
                    )}
                  </div>
                  <p className="text-muted small mb-2">{post.start_date} to {post.end_date}</p>
                  <p className="text-muted small mb-2">Need: {post.companions_needed - (post.accepted_count || 0)} more companion{post.companions_needed - (post.accepted_count || 0) !== 1 ? 's' : ''}</p>
                  <p className="text-muted small mb-2">{post.travel_interests}</p>
                  <p className="small text-secondary" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.description}</p>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                    <span className="badge bg-success bg-opacity-10 text-success small text-capitalize">{post.gender_preference}</span>
                    {currentUser && currentUser.id !== post.owner_id ? (
                      <button
                        className="btn btn-gradient btn-sm rounded-pill px-3"
                        data-bs-toggle="modal"
                        data-bs-target="#requestJoinModal"
                        onClick={() => {
                          setRequestPost(post);
                          setRequestMsg('');
                        }}
                      >
                        Request Join
                      </button>
                    ) : (
                      <span className="badge bg-info bg-opacity-10 text-info small">Your Post</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted mb-0">No open companion posts are available right now.</p>
          </div>
        )}
      </div>

      <div className="row g-4">

        {/* Column 1: My Companion Posts (Active Only) */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-primary"><i className="bi bi-postcard-fill me-2"></i> My Active Posts</h5>
            {activeMyPosts.length > 0 ? (
              <div className="list-group list-group-flush">
                {activeMyPosts.map(post => {
                  const incomingCount = incomingRequests.filter(r => r.post_id === post.id && r.status === 'pending').length;
                  const acceptedCompanions = incomingRequests.filter(r => r.post_id === post.id && r.status === 'accepted');
                  return (
                    <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={post.id}>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="flex-grow-1">
                          <h6 className="fw-bold mb-1">{post.destination_place}</h6>
                          <span className="text-muted small d-block"><i className="bi bi-calendar"></i> {post.start_date} to {post.end_date}</span>
                        </div>
                        <span className={`badge bg-${post.status === 'open' ? 'success' : 'danger'} rounded-pill small`}>
                          {post.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="small text-muted mb-2">
                        <strong>Companions:</strong> {acceptedCompanions.length} / {post.companions_needed} accepted
                      </div>
                      {acceptedCompanions.length > 0 && (
                        <div className="bg-light p-2 rounded mb-2 small text-dark">
                          <strong>Joined:</strong> {acceptedCompanions.map(c => c.requester_name).join(', ')}
                        </div>
                      )}
                      {incomingCount > 0 && (
                        <span className="badge bg-info rounded-pill small mb-2">
                          {incomingCount} new request{incomingCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <div className="d-flex gap-2 pt-2">
                        {post.status === 'open' && (
                          <>
                            <button
                              className="btn btn-warning btn-sm rounded-2 flex-grow-1"
                              onClick={() => handleClosePost(post.id)}
                              title="Close this post when you've found enough companions"
                            >
                              Close
                            </button>
                            <button
                              className="btn btn-danger btn-sm rounded-2"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                        {post.status === 'closed' && (
                          <button
                            className="btn btn-danger btn-sm w-100 rounded-2"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No active companion search posts.</p>
            )}
          </div>
        </div>

        {/* Column 2: Incoming Requests (Active Only) */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-warning"><i className="bi bi-inbox-fill me-2"></i> Incoming Requests</h5>
            {activeIncomingRequests.length > 0 ? (
              <div className="list-group list-group-flush">
                {activeIncomingRequests.map(req => {
                  const age = req.date_of_birth ? new Date().getFullYear() - new Date(req.date_of_birth).getFullYear() : '?';
                  return (
                    <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={req.id}>
                      <div className="mb-2">
                        <div className="d-flex gap-2 align-items-start mb-2">
                          <img
                            src={getProfilePhoto(req.requester_photo)}
                            alt={req.requester_name}
                            className="rounded-circle"
                            style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                          />
                          <div className="flex-grow-1">
                            <h6 className="fw-bold mb-0 small">{req.requester_name}</h6>
                            <span className="text-muted text-capitalize" style={{ fontSize: '11px' }}>
                              {req.requester_gender}, {age} yrs • {req.destination_place}
                            </span>
                          </div>
                        </div>
                        <p className="text-muted small mb-2 italic" style={{ fontSize: '12px' }}>"{req.message}"</p>
                        <span className={`badge badge-${req.status} small`}>
                          {req.status.toUpperCase()}
                        </span>
                      </div>
                      {req.status === 'pending' && (
                        <div className="d-flex gap-2 pt-2">
                          <button
                            className="btn btn-success btn-sm flex-grow-1 rounded-2"
                            onClick={() => handleApproveRequest(req.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm flex-grow-1 rounded-2"
                            onClick={() => handleRejectRequest(req.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No pending incoming requests.</p>
            )}
          </div>
        </div>

        {/* Column 3: Sent Join Requests (Active Only) */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-success"><i className="bi bi-person-fill-add me-2"></i> Sent Requests</h5>
            {activeMyRequests.length > 0 ? (
              <div className="list-group list-group-flush">
                {activeMyRequests.map(req => (
                  <div className="list-group-item bg-transparent px-0 py-3 border-bottom" key={req.id}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h6 className="fw-bold mb-1 small">To: {req.owner_name}</h6>
                        <span className="text-muted small d-block">{req.destination_place}</span>
                        <span className="text-muted small d-block" style={{ fontSize: '11px' }}>
                          {req.start_date} to {req.end_date}
                        </span>
                      </div>
                      <span className={`badge badge-${req.status} small`}>
                        {req.status.toUpperCase()}
                      </span>
                    </div>
                    {req.status === 'accepted' && (
                      <div className="bg-success bg-opacity-10 text-success p-2 rounded mb-2 small">
                        <strong>Contact Info Shared:</strong><br />
                        <i className="bi bi-telephone"></i> {req.owner_contact} <br />
                        <i className="bi bi-envelope"></i> {req.owner_email}
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <button
                        className="btn btn-outline-danger btn-sm w-100 rounded-2"
                        onClick={() => handleCancelRequest(req.id)}
                      >
                        Cancel Request
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted small text-center py-4">No active sent requests.</p>
            )}
          </div>
        </div>
      </div>

      {/* PAST ACTIVITIES SECTION */}
      <div className="card glass-card border-0 p-4 mt-5">
        <h4 className="fw-bold mb-3 text-gradient"><i className="bi bi-clock-history me-2"></i> Past Companion Activities</h4>
        <p className="text-muted small mb-4">View your completed companion trips and coordinate ratings.</p>

        {pastMyPosts.length === 0 && pastMyRequests.length === 0 ? (
          <div className="text-center py-5">
            <i className="bi bi-calendar-x fs-2 text-muted"></i>
            <p className="text-muted mt-2 mb-0">No past activities logged.</p>
          </div>
        ) : (
          <div className="row g-4">
            {/* Created past trips */}
            {pastMyPosts.length > 0 && (
              <div className="col-md-6">
                <div className="p-3 border rounded-4 bg-white bg-opacity-5 h-100">
                  <h5 className="fw-bold mb-3 text-primary" style={{ fontSize: '15px' }}><i className="bi bi-house-door-fill"></i> Trips Hosted by You</h5>
                  <div className="d-flex flex-column gap-3">
                    {pastMyPosts.map(post => {
                      const acceptedCompanions = incomingRequests.filter(r => r.post_id === post.id && r.status === 'accepted');
                      return (
                        <div key={post.id} className="p-3 border rounded-3 bg-light text-dark">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <h6 className="fw-bold mb-0 text-dark small">{post.destination_place}</h6>
                              <span className="small text-muted">{post.start_date} to {post.end_date}</span>
                            </div>
                            {post.trip_rating_count > 0 ? (
                              <span className="badge bg-warning text-dark">★ {post.trip_rating}/10</span>
                            ) : (
                              <span className="badge bg-secondary text-white">Unrated</span>
                            )}
                          </div>

                          <div className="mt-3">
                            <span className="small fw-bold text-secondary d-block mb-1">Companions Who Joined:</span>
                            {acceptedCompanions.length > 0 ? (
                              <div className="d-flex flex-column gap-2 mt-2">
                                {acceptedCompanions.map(c => (
                                  <div key={c.id} className="bg-white p-2 rounded border small d-flex align-items-center justify-content-between">
                                    <div>
                                      <strong className="text-dark d-block">{c.requester_name}</strong>
                                      <span className="text-muted" style={{ fontSize: '10px' }}>{c.requester_email} • {c.requester_contact}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="small text-muted italic">No companions joined this trip.</span>
                            )}
                          </div>

                          {acceptedCompanions.length > 0 && (
                            <div className="mt-3 text-end">
                              <button
                                className="btn btn-xs btn-outline-gradient rounded-pill px-3 py-1"
                                data-bs-toggle="modal"
                                data-bs-target="#dashboardRateCompanionsModal"
                                onClick={() => handleOpenRateModal(post.id)}
                                style={{ fontSize: '11px' }}
                              >
                                <i className="bi bi-star-fill text-warning me-1"></i> Rate Companions
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Joined past trips */}
            {pastMyRequests.length > 0 && (
              <div className="col-md-6">
                <div className="p-3 border rounded-4 bg-white bg-opacity-5 h-100">
                  <h5 className="fw-bold mb-3 text-success" style={{ fontSize: '15px' }}><i className="bi bi-airplane-fill"></i> Trips You Joined</h5>
                  <div className="d-flex flex-column gap-3">
                    {pastMyRequests.map(req => (
                      <div key={req.id} className="p-3 border rounded-3 bg-light text-dark">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="fw-bold mb-0 text-dark small">{req.destination_place}</h6>
                            <span className="small text-muted">{req.start_date} to {req.end_date}</span>
                          </div>
                          {req.trip_rating_count > 0 ? (
                            <span className="badge bg-warning text-dark">★ {req.trip_rating}/10</span>
                          ) : (
                            <span className="badge bg-secondary text-white">Unrated</span>
                          )}
                        </div>

                        <div className="mt-3 bg-white p-3 rounded border small">
                          <span className="small fw-bold text-secondary d-block mb-1">Host Contact Information:</span>
                          <strong className="text-dark d-block">{req.owner_name}</strong>
                          <span className="text-muted d-block">{req.owner_email}</span>
                          <span className="text-muted d-block">{req.owner_contact}</span>
                        </div>

                        <div className="mt-3 text-end">
                          <button
                            className="btn btn-xs btn-outline-gradient rounded-pill px-3 py-1"
                            data-bs-toggle="modal"
                            data-bs-target="#dashboardRateCompanionsModal"
                            onClick={() => handleOpenRateModal(req.post_id)}
                            style={{ fontSize: '11px' }}
                          >
                            <i className="bi bi-star-fill text-warning me-1"></i> Rate Companions
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
