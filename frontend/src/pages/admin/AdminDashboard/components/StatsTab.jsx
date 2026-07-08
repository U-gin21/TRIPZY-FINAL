import React from 'react';
import { getUploadUrl } from '../../../../api';

export default function StatsTab({ stats }) {
  // Helper to parse Sales Chart Data
  const getSalesChartData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push({ month: label, value: 0 });
    }

    if (stats && stats.monthly_sales && stats.monthly_sales.length > 0) {
      stats.monthly_sales.forEach(item => {
        // Map database formatted values like "Jul 2026"
        const match = months.find(m => m.month.toLowerCase() === item.month.toLowerCase());
        if (match) {
          match.value = parseFloat(item.sales) || 0;
        }
      });
    }
    
    return months;
  };

  // Helper to parse Users Chart Data
  const getUsersChartData = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months.push({ month: label, value: 0 });
    }

    if (stats && stats.monthly_users && stats.monthly_users.length > 0) {
      stats.monthly_users.forEach(item => {
        const match = months.find(m => m.month.toLowerCase() === item.month.toLowerCase());
        if (match) {
          match.value = parseInt(item.count) || 0;
        }
      });
    }
    
    return months;
  };

  // SVG Chart Computations
  const salesData = getSalesChartData();
  const maxSales = Math.max(...salesData.map(d => d.value), 10000);
  
  const usersData = getUsersChartData();
  const maxUsers = Math.max(...usersData.map(d => d.value), 10);

  const width = 500;
  const height = 180;
  const paddingLeft = 55;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Sales points calculation
  const salesPoints = salesData.map((d, index) => {
    const x = paddingLeft + (index / (salesData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.value / maxSales) * chartHeight;
    return { x, y, label: d.month.split(' ')[0], value: d.value };
  });

  const salesLinePath = salesPoints.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const salesAreaPath = salesPoints.length > 0 
    ? `${salesLinePath} L ${salesPoints[salesPoints.length - 1].x} ${paddingTop + chartHeight} L ${salesPoints[0].x} ${paddingTop + chartHeight} Z`
    : '';

  return (
    <div>
      <h2 className="fw-bold text-gradient mb-4">System Overview Statistics</h2>
      
      {stats ? (
        <div>
          {/* Top statistics overview row */}
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Total Admins/Tourists</h6>
                <h3 className="fw-bold text-primary mt-2">
                  {stats.users.reduce((acc, curr) => acc + curr.count, 0)} Accounts
                </h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Active Services Listed</h6>
                <h3 className="fw-bold text-success mt-2">
                  {stats.services.reduce((acc, curr) => acc + curr.count, 0)} listings
                </h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white text-center">
                <h6 className="text-muted small uppercase">Bookings Logged</h6>
                <h3 className="fw-bold text-info mt-2">
                  {stats.bookings.reduce((acc, curr) => acc + curr.count, 0)} trips
                </h3>
              </div>
            </div>
          </div>

          {/* Interactive Visual Graphs */}
          <div className="row g-4 mb-4">
            {/* Sales Chart */}
            <div className="col-md-6">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-dark">Monthly Revenue Trend</h5>
                  <span className="badge bg-emerald rounded-pill px-3 py-1.5 small text-white" style={{ fontSize: '10px', backgroundColor: 'var(--primary-color)' }}>
                    Completed Bookings (LKR)
                  </span>
                </div>
                
                <div className="chart-svg-container" style={{ position: 'relative', width: '100%' }}>
                  <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#009aa7" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#009aa7" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Y-axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = paddingTop + chartHeight * ratio;
                      const valLabel = Math.round(maxSales * (1 - ratio));
                      return (
                        <g key={i}>
                          <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                          <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#94a3b8" style={{ fontSize: '10px', fontWeight: '500' }}>
                            {valLabel >= 1000 ? `${(valLabel / 1000).toFixed(0)}k` : valLabel}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Area under line */}
                    {salesAreaPath && (
                      <path d={salesAreaPath} fill="url(#salesGrad)" />
                    )}
                    
                    {/* Trend line */}
                    {salesLinePath && (
                      <path d={salesLinePath} fill="none" stroke="#009aa7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    
                    {/* Interactive dots and month labels */}
                    {salesPoints.map((p, idx) => (
                      <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#009aa7" strokeWidth="2.5" />
                        <text x={p.x} y={paddingTop + chartHeight + 16} textAnchor="middle" fill="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                          {p.label}
                        </text>
                      </g>
                    ))}
                  </svg>
                </div>
              </div>
            </div>

            {/* Users Registered Chart */}
            <div className="col-md-6">
              <div className="card border-0 p-4 rounded-4 shadow-sm bg-white">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0 text-dark">User Registrations Trend</h5>
                  <span className="badge bg-warning text-dark rounded-pill px-3 py-1.5 small" style={{ fontSize: '10px', backgroundColor: 'rgba(255, 159, 28, 0.1)' }}>
                    New Accounts Joined
                  </span>
                </div>
                
                <div className="chart-svg-container" style={{ position: 'relative', width: '100%' }}>
                  <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
                    <defs>
                      <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ff9f1c" stopOpacity="1" />
                        <stop offset="100%" stopColor="#ff5e3a" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                    
                    {/* Y-axis Grid Lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                      const y = paddingTop + chartHeight * ratio;
                      const valLabel = Math.round(maxUsers * (1 - ratio));
                      return (
                        <g key={i}>
                          <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="rgba(0,0,0,0.05)" strokeDasharray="3" />
                          <text x={paddingLeft - 8} y={y + 4} textAnchor="end" fill="#94a3b8" style={{ fontSize: '10px', fontWeight: '500' }}>
                            {valLabel}
                          </text>
                        </g>
                      );
                    })}
                    
                    {/* Render Bar Columns */}
                    {(() => {
                      const barWidth = 24;
                      return usersData.map((d, index) => {
                        const x = paddingLeft + (index / (usersData.length - 1)) * (chartWidth - barWidth);
                        const barHeight = (d.value / maxUsers) * chartHeight;
                        const y = paddingTop + chartHeight - barHeight;
                        
                        return (
                          <g key={index}>
                            {/* Rounded Bar */}
                            <rect 
                              x={x} 
                              y={y} 
                              width={barWidth} 
                              height={Math.max(2, barHeight)} 
                              fill="url(#usersGrad)" 
                              rx="3" 
                              ry="3" 
                            />
                            {/* Value indicator label on top */}
                            <text x={x + barWidth/2} y={y - 5} textAnchor="middle" fill="#0f172a" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                              {d.value}
                            </text>
                            {/* Label */}
                            <text x={x + barWidth/2} y={paddingTop + chartHeight + 16} textAnchor="middle" fill="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }}>
                              {d.month.split(' ')[0]}
                            </text>
                          </g>
                        );
                      });
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown lists row */}
          <div className="row g-4">
            <div className="col-md-6">
              <div className="card glass-card p-4 border-0">
                <h5 className="fw-bold mb-3 text-gradient">User Directory Breakdown</h5>
                <ul className="list-group list-group-flush">
                  {stats.users.map(u => (
                    <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize px-0" key={u.user_type}>
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
                    <li className="list-group-item bg-transparent d-flex justify-content-between text-capitalize px-0" key={s.service_type}>
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
