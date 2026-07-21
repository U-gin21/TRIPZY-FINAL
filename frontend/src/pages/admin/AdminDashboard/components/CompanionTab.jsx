import React, { useState } from 'react';

export default function CompanionTab({ posts, onDeletePost }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  // Filter posts based on query, status, and rating
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.destination_place.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.owner_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.owner_email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;

    let matchesRating = true;
    if (ratingFilter === 'rated') {
      matchesRating = post.trip_rating_count > 0;
    } else if (ratingFilter === 'unrated') {
      matchesRating = post.trip_rating_count === 0;
    }

    return matchesSearch && matchesStatus && matchesRating;
  });

  const handleDelete = (postId, destination) => {
    if (window.confirm(`Are you sure you want to delete the companion post to "${destination}"? This will permanently remove all associated requests and ratings.`)) {
      onDeletePost(postId);
    }
  };

  return (
    <div className="card glass-card p-4 border-0 shadow-lg mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Companion Finder Management</h2>
          <p className="text-muted small mb-0">Monitor active travel posts, inspect companion matched bookings, and moderate listings.</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <span className="badge bg-emerald rounded-pill px-3 py-2">
            Total Posts: {filteredPosts.length}
          </span>
        </div>
      </div>

      {/* Filters Row */}
      <div className="row g-3 mb-4 align-items-end">
        <div className="col-md-5">
          <label className="form-label small fw-bold text-muted">Search Posts</label>
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0 text-muted">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0 ps-0"
              placeholder="Search by destination or creator name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ boxShadow: 'none' }}
            />
          </div>
        </div>

        <div className="col-md-3">
          <label className="form-label small fw-bold text-muted">Status</label>
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Listings</option>
            <option value="closed">Closed / Finished</option>
          </select>
        </div>

        <div className="col-md-4">
          <label className="form-label small fw-bold text-muted">Trip Rating</label>
          <select
            className="form-select"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ boxShadow: 'none' }}
          >
            <option value="all">All Ratings</option>
            <option value="rated">Rated Trips Only</option>
            <option value="unrated">Unrated Trips Only</option>
          </select>
        </div>
      </div>

      {/* Posts Table */}
      <div className="table-responsive">
        {filteredPosts.length > 0 ? (
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Creator Details</th>
                <th>Destination</th>
                <th>Dates</th>
                <th>Companions</th>
                <th>Trip Rating</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="fw-bold text-dark">{post.owner_name}</div>
                    <span className="text-muted small">{post.owner_email}</span>
                  </td>
                  <td>
                    <div className="fw-bold text-emerald">{post.destination_place}</div>
                    {post.gender_preference && (
                      <span className="badge bg-light text-secondary border text-capitalize small mt-1" style={{ fontSize: '10px' }}>
                        Gender: {post.gender_preference}
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="small text-dark">{post.start_date} to {post.end_date}</div>
                    <span className="text-muted small" style={{ fontSize: '10px' }}>
                      Posted: {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <div className="fw-bold small text-dark">
                      {post.accepted_count || 0} / {post.companions_needed} Accepted
                    </div>
                    <div className="progress mt-1" style={{ height: '4px', width: '100px' }}>
                      <div
                        className="progress-bar bg-teal"
                        role="progressbar"
                        style={{ width: `${Math.min(100, ((post.accepted_count || 0) / post.companions_needed) * 100)}%` }}
                      ></div>
                    </div>
                  </td>
                  <td>
                    {post.trip_rating_count > 0 ? (
                      <div>
                        <span className="badge bg-warning text-dark px-2 py-1 rounded small">
                          ★ {post.trip_rating}/10
                        </span>
                        <span className="text-muted small d-block" style={{ fontSize: '10px', marginTop: '2px' }}>
                          ({post.trip_rating_count} rating{post.trip_rating_count !== 1 ? 's' : ''})
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted small">No ratings</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge rounded-pill px-3 py-1 text-capitalize ${post.status === 'open' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-outline-danger btn-sm rounded-circle p-2"
                      onClick={() => handleDelete(post.id, post.destination_place)}
                      title="Delete Post"
                      style={{ width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-5 text-muted bg-light rounded-4">
            <i className="bi bi-postcard fs-1 text-muted"></i>
            <p className="mb-0 mt-2">No companion posts found matching filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
