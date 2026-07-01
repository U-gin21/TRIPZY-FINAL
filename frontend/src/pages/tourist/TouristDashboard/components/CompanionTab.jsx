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
  setRequestMsg 
}) {
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
                  <h6 className="fw-bold mb-2">{post.destination_place}</h6>
                  <p className="text-muted small mb-2">{post.start_date} to {post.end_date}</p>
                  <p className="text-muted small mb-2">Need: {post.companions_needed} companion{post.companions_needed !== 1 ? 's' : ''}</p>
                  <p className="text-muted small mb-2">{post.travel_interests}</p>
                  <p className="small text-secondary" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{post.description}</p>
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mt-3">
                    <span className="badge bg-success bg-opacity-10 text-success small">{post.gender_preference}</span>
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
        
        {/* Column 1: My Companion Posts */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-primary"><i className="bi bi-postcard-fill me-2"></i> My Travel Posts</h5>
            {myPosts.length > 0 ? (
              <div className="list-group list-group-flush">
                {myPosts.map(post => {
                  const incomingCount = incomingRequests.filter(r => r.post_id === post.id && r.status === 'pending').length;
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
              <p className="text-muted small text-center py-4">No companion search posts yet.</p>
            )}
          </div>
        </div>

        {/* Column 2: Incoming Requests */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-warning"><i className="bi bi-inbox-fill me-2"></i> Incoming Requests</h5>
            {incomingRequests.length > 0 ? (
              <div className="list-group list-group-flush">
                {incomingRequests.map(req => {
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
              <p className="text-muted small text-center py-4">No incoming requests yet.</p>
            )}
          </div>
        </div>

        {/* Column 3: Sent Join Requests */}
        <div className="col-lg-4">
          <div className="card glass-card border-0 p-4 h-100">
            <h5 className="fw-bold mb-3 text-success"><i className="bi bi-person-fill-add me-2"></i> Sent Requests</h5>
            {myRequests.length > 0 ? (
              <div className="list-group list-group-flush">
                {myRequests.map(req => (
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
              <p className="text-muted small text-center py-4">No sent requests yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
