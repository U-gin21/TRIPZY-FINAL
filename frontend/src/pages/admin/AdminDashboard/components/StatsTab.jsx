import React from 'react';

export default function StatsTab({ stats }) {
  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">System Overview Statistics</h2>
      
      {stats ? (
        <div>
          <div className="row g-4 mb-5">
            <div className="col-md-3">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Total Admins/Tourists</h6>
                <h3 className="fw-bold text-primary mt-2">
                  {stats.users.reduce((acc, curr) => acc + curr.count, 0)} Accounts
                </h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Active Services Listed</h6>
                <h3 className="fw-bold text-success mt-2">
                  {stats.services.reduce((acc, curr) => acc + curr.count, 0)} listings
                </h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Bookings Logged</h6>
                <h3 className="fw-bold text-info mt-2">
                  {stats.bookings.reduce((acc, curr) => acc + curr.count, 0)} trips
                </h3>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Total Offline Revenue</h6>
                <h3 className="fw-bold text-warning mt-2">
                  LKR {Number(stats.bookings.find(b => b.status === 'completed')?.total_earnings || 0).toLocaleString()}
                </h3>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="card glass-card p-4 border-0">
                <h5 className="fw-bold mb-3 text-gradient">User Directory Breakdown</h5>
                <ul className="list-group list-group-flush">
                  {stats.users.map(u => (
                    <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize" key={u.user_type}>
                      <span>{u.user_type}s</span>
                      <strong>{u.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="col-md-6">
              <div className="card glass-card p-4 border-0">
                <h5 className="fw-bold mb-3 text-gradient">Service Posts Breakdown</h5>
                <ul className="list-group list-group-flush">
                  {stats.services.map(s => (
                    <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize" key={s.service_type}>
                      <span>{s.service_type.replace('_', ' ')}s</span>
                      <strong>{s.count}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted">Loading system metrics...</p>
      )}
    </div>
  );
}
