import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function BookServicesTab({ services, serviceTypeFilter, setServiceTypeFilter, setSelectedService }) {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3 border-bottom pb-3">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Book Tourism Services</h2>
          <p className="text-muted small mb-0">Reserve premium hotels, vehicles, guides, or camping tools in Sri Lanka.</p>
        </div>
        <div className="d-flex gap-2 bg-white p-2 rounded-pill shadow-sm border">
          {[
            { id: 'hotel', label: 'Hotels', icon: 'bi-building' },
            { id: 'vehicle', label: 'Vehicles', icon: 'bi-car-front' },
            { id: 'guide', label: 'Guides', icon: 'bi-compass' },
            { id: 'camping_tool', label: 'Camping', icon: 'bi-backpack' },
          ].map((item) => (
            <button
              key={item.id}
              className={`btn px-3 py-2 rounded-pill fw-bold border-0 transition d-flex align-items-center gap-2`}
              style={{
                background: serviceTypeFilter === item.id ? 'var(--grad-blue-green)' : 'transparent',
                color: serviceTypeFilter === item.id ? '#fff' : '#64748b',
                fontSize: '13px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onClick={() => setServiceTypeFilter(item.id)}
            >
              <i className={`bi ${item.icon}`}></i> {item.label}
            </button>
          ))}
        </div>
      </div>

      {services.length > 0 ? (
        <div className="row g-4">
          {services.map(srv => (
            <div className="col-md-6 col-lg-4" key={srv.id}>
              <div className="card glass-card h-100 border-0 overflow-hidden">
                <img 
                  src={getUploadUrl(srv.photo) || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'} 
                  alt={srv.name_of_institute} 
                  style={{ height: '180px', objectFit: 'cover' }}
                />
                <div className="card-body p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="badge bg-info bg-opacity-10 text-info text-capitalize">{srv.service_type}</span>
                      <span className="text-warning small fw-bold">
                        ★ {Number(srv.average_rating).toFixed(1)} ({srv.review_count} reviews)
                      </span>
                    </div>
                    <h5 className="fw-bold text-gradient mb-2">{srv.name_of_institute}</h5>
                    <p className="text-muted small line-clamp-3 mb-3">{srv.description}</p>
                    <div className="mb-3 small">
                      <span className="fw-bold d-block">Contact Support:</span>
                      <span className="text-muted">{srv.contact_no} | {srv.email}</span>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                    <div>
                      <span className="text-muted small">Price / Day:</span>
                      <h5 className="fw-bold mb-0 text-success">LKR {Number(srv.price).toLocaleString()}</h5>
                    </div>
                    <button 
                      className="btn btn-gradient btn-sm rounded-pill px-4"
                      data-bs-toggle="modal"
                      data-bs-target="#bookServiceModal"
                      onClick={() => setSelectedService(srv)}
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5 card glass-card border-0">
          <i className="bi bi-shop fs-1 text-muted"></i>
          <h5 className="fw-bold mt-3">No Services Available</h5>
          <p className="text-muted">No verified providers are currently listed in this category.</p>
        </div>
      )}
    </div>
  );
}
