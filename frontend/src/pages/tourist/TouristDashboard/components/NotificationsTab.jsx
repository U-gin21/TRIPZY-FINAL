import React from 'react';

export default function NotificationsTab({ notifications }) {
  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">Notification Center</h2>
      <div className="card glass-card border-0 p-4">
        <div className="d-flex flex-column gap-3">
          {notifications.map(n => (
            <div className="d-flex align-items-start gap-3 p-3 bg-white rounded-3 shadow-sm border-start border-4 border-primary" key={n.id}>
              <i className="bi bi-info-circle-fill text-primary fs-4"></i>
              <div>
                <p className="mb-0 text-dark small">{n.message}</p>
                <span className="text-muted" style={{ fontSize: '10px' }}>{n.date}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
