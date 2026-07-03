import React from 'react';

export default function PageHero({ title, subtitle, badge, backgroundImage, children }) {
  return (
    <section 
      className="page-hero text-center d-flex align-items-center justify-content-center flex-column" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(2, 44, 34, 0.72), rgba(15, 23, 42, 0.62)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '380px',
        position: 'relative',
        color: '#fff'
      }}
    >
      <div className="page-hero-gradient-overlay"></div>
      <div className="container position-relative z-3 animate-fade-in text-center">
        {badge && (
          <span className="badge bg-success rounded-pill px-3 py-2 mb-3 text-uppercase" style={{ letterSpacing: '1.5px', fontSize: '11px', background: 'var(--primary-color) !important' }}>
            {badge}
          </span>
        )}
        <h1 className="display-4 fw-bold text-white mb-3 text-shadow" style={{ letterSpacing: '-0.5px' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="lead text-white-50 col-md-8 mx-auto mb-0 text-shadow" style={{ fontSize: '1.1rem', fontWeight: '400' }}>
            {subtitle}
          </p>
        )}
        {children && (
          <div className="mt-4 text-start">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
