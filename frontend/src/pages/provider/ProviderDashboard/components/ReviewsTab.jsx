import React, { useState } from 'react';
import { getProfilePhoto, getUploadUrl } from '../../../../api';

export default function ReviewsTab({ listings, reviews, onRefresh }) {
  // Filter state to let provider toggle between viewing all services or a specific one
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('all');

  // Calculate average rating across all reviews
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / reviews.length).toFixed(1)
    : '0.0';

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
          style={{ marginRight: '3px' }}
        ></i>
      );
    }
    return stars;
  };

  const getServiceTypeBadgeClass = (type) => {
    const serviceTypeColors = {
      hotel: 'bg-primary text-white',
      vehicle: 'bg-success text-white',
      guide: 'bg-info text-dark',
      camping_tool: 'bg-warning text-dark'
    };
    return serviceTypeColors[type] || 'bg-secondary text-white';
  };

  // Filter listings based on the dropdown
  const filteredListings = selectedServiceFilter === 'all'
    ? listings
    : listings.filter(s => s.id.toString() === selectedServiceFilter);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Service Ratings & Reviews</h2>
          <p className="text-muted small mb-0">Track customer feedback separated by each of your service listings.</p>
        </div>
        <div className="d-flex gap-2">
          {/* Service Dropdown Filter */}
          <select 
            className="form-select form-select-sm rounded-pill px-3 bg-white border shadow-sm"
            value={selectedServiceFilter}
            onChange={(e) => setSelectedServiceFilter(e.target.value)}
            style={{ width: '220px' }}
          >
            <option value="all">All Services ({listings.length})</option>
            {listings.map(s => (
              <option key={s.id} value={s.id}>{s.name_of_institute}</option>
            ))}
          </select>
          <button className="btn btn-outline-gradient btn-sm rounded-pill px-3" onClick={onRefresh}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-6 col-lg-4">
          <div className="card glass-card border-0 p-3 h-100 d-flex flex-row align-items-center gap-3">
            <div className="profile-stat-icon bg-warning bg-opacity-10 text-warning fs-3 mb-0 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '50px', height: '50px' }}>
              <i className="bi bi-star-fill animate-float"></i>
            </div>
            <div>
              <h3 className="fw-bold text-dark mb-0">{averageRating} / 5.0</h3>
              <span className="text-muted small">Overall Platform Rating</span>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="card glass-card border-0 p-3 h-100 d-flex flex-row align-items-center gap-3">
            <div className="profile-stat-icon bg-primary bg-opacity-10 text-primary fs-3 mb-0 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '50px', height: '50px' }}>
              <i className="bi bi-chat-left-heart-fill"></i>
            </div>
            <div>
              <h3 className="fw-bold text-dark mb-0">{reviews.length}</h3>
              <span className="text-muted small">Overall Service Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Services Review List */}
      <div className="d-flex flex-column gap-4">
        {filteredListings.length > 0 ? (
          filteredListings.map((service) => {
            // Get reviews for this specific service
            const serviceReviews = reviews.filter(r => parseInt(r.service_id) === parseInt(service.id));
            const serviceAvg = serviceReviews.length > 0
              ? (serviceReviews.reduce((acc, r) => acc + parseInt(r.rating), 0) / serviceReviews.length).toFixed(1)
              : '0.0';

            return (
              <div key={service.id} className="card glass-card border-0 p-4 shadow-sm" style={{ backgroundColor: 'var(--card-bg)' }}>
                
                {/* Service Header Info */}
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <img 
                      src={getUploadUrl(service.photo)} 
                      alt={service.name_of_institute} 
                      className="rounded-3 shadow-sm border border-light"
                      style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <h5 className="fw-bold text-dark mb-0">{service.name_of_institute}</h5>
                        <span className={`badge ${getServiceTypeBadgeClass(service.service_type)} rounded-pill text-uppercase`} style={{ fontSize: '8px', padding: '3px 8px' }}>
                          {service.service_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-muted mb-0 small mt-1">Base Rate: LKR {service.price}</p>
                    </div>
                  </div>

                  <div className="text-end bg-light p-2 px-3 rounded-3 border" style={{ backgroundColor: 'var(--dashboard-bg) !important' }}>
                    <div className="d-flex align-items-center gap-2">
                      <span className="fw-bold text-dark">{serviceAvg} / 5.0</span>
                      <div className="text-warning small">
                        {renderStars(Math.round(parseFloat(serviceAvg)))}
                      </div>
                    </div>
                    <span className="text-muted small" style={{ fontSize: '11px' }}>
                      ({serviceReviews.length} client review{serviceReviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                </div>

                {/* Service Specific Reviews List */}
                <div className="mt-2">
                  {serviceReviews.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {serviceReviews.map((rev) => (
                        <div key={rev.id} className="p-3 rounded-4 bg-white border border-light shadow-sm" style={{ transition: 'transform 0.25s', backgroundColor: 'var(--input-bg)' }} onMouseOver={(e) => e.currentTarget.style.transform = 'translateX(3px)'} onMouseOut={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                          <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                            {/* Tourist Profiling */}
                            <div className="d-flex align-items-center gap-2">
                              <img 
                                src={getProfilePhoto(rev.tourist_photo)} 
                                alt={rev.tourist_name} 
                                className="rounded-circle border border-1 border-emerald" 
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              />
                              <div>
                                <h6 className="fw-bold mb-0 text-dark small">{rev.tourist_name}</h6>
                                <span className="text-muted small" style={{ fontSize: '10px' }}>
                                  {new Date(rev.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                            </div>

                            {/* Stars rating */}
                            <div className="small">
                              {renderStars(rev.rating)}
                              <span className="ms-1 fw-bold text-dark">{rev.rating}/5</span>
                            </div>
                          </div>

                          {/* Comment details */}
                          <p className="text-muted mb-0 small ps-1" style={{ fontStyle: rev.comment ? 'normal' : 'italic', fontSize: '0.88rem' }}>
                            {rev.comment ? `"${rev.comment}"` : 'No comments submitted.'}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-light rounded-4 border border-dashed border-2" style={{ backgroundColor: 'var(--dashboard-bg) !important' }}>
                      <i className="bi bi-chat-left-text text-muted fs-3"></i>
                      <p className="text-muted small mb-0 mt-2">No customer feedback reviews submitted for this service listing yet.</p>
                    </div>
                  )}
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-5 card glass-card border-0">
            <i className="bi bi-emoji-frown fs-1 text-muted"></i>
            <h5 className="fw-bold mt-3">No Listings Found</h5>
            <p className="text-muted small">Create an active offer listing first to start receiving customer ratings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
