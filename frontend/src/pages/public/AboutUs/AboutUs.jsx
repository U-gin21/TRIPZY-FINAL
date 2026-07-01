import React from 'react';
import PageHero from '../../../components/common/PageHero';
import about_us_hero from '../../../assets/about_us_hero.jpg';
import about_us from '../../../assets/about_us.jpg';

export default function AboutUs() {
  return (
    <div className="animate-fade-in">
      <PageHero 
        title="Discover the Soul of Sri Lanka"
        subtitle="We are dedicated to bringing the Pearl of the Indian Ocean closer to your fingertips through a centralized, intelligent, and seamless booking experience."
        badge="Who We Are"
        backgroundImage={about_us_hero}
      />

      <div className="container pb-5">

      {/* Visual / Introduction */}
      <div className="row align-items-center mb-5 g-5">
        <div className="col-lg-6">
          <div className="position-relative">
            <div className="position-absolute top-0 start-0 w-100 h-100 bg-success bg-opacity-10 rounded-4" style={{ transform: 'rotate(-3deg)', zIndex: -1 }}></div>
            <img 
              src={about_us} 
              alt="Beautiful Sri Lanka Ella" 
              className="img-fluid rounded-4 shadow-sm animate-float w-100"
              style={{ objectFit: 'cover', maxHeight: '400px' }}
            />
          </div>
        </div>
        <div className="col-lg-6">
          <h2 className="fw-bold mb-3 text-gradient">Smart Travel Redefined</h2>
          <p className="text-muted mb-3">
Founded in 2026, Tripzy was created to simplify tourism in Sri Lanka through a single smart platform. We bring together hotel booking, vehicle rental, tour guide services, camping tool rental, destination discovery, weather information, and travel companion features to make travel planning easier and more convenient. Our goal is to enhance the tourism experience by connecting travelers with the services they need in one place
          </p>
          <p className="text-muted mb-4">
Driven by innovation and a passion for tourism, Tripzy aims to create a seamless travel experience for both local and international travelers. Our platform is designed to provide convenience, accessibility, and reliable information, helping users explore the beauty of Sri Lanka with confidence.          </p>
          
          <div className="row g-3">
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>100% Secure Auth</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Dynamic Weather Sync</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Verified Service Providers</span>
              </div>
            </div>
            <div className="col-6">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-check-circle-fill text-success fs-5"></i>
                <span className="fw-bold text-dark" style={{ fontSize: '14px' }}>Companion Matcher</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="text-center mb-4 mt-5">
        <span className="text-emerald fw-bold small text-uppercase">Our Foundation</span>
        <h3 className="fw-bold mt-1 text-gradient">The Pillars of Tripzy</h3>
      </div>

      <div className="row g-4 text-center">
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0 shadow-sm rounded-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', background: 'rgba(5, 150, 105, 0.1)', color: '#059669' }}>
              <i className="bi bi-shield-fill-check fs-3"></i>
            </div>
            <h4 className="fw-bold mb-2">Trust & Integrity</h4>
            <p className="text-muted small mb-0">Every provider registration goes through an admin vetting phase to ensure tourists enjoy secure and top-tier services.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0 shadow-sm rounded-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488' }}>
              <i className="bi bi-people-fill fs-3"></i>
            </div>
            <h4 className="fw-bold mb-2">Community Driven</h4>
            <p className="text-muted small mb-0">Our unique Companion Finder builds community travel groups, making expensive tours highly accessible through budget-sharing.</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card glass-card h-100 p-4 border-0 shadow-sm rounded-4">
            <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '60px', height: '60px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
              <i className="bi bi-activity fs-3"></i>
            </div>
            <h4 className="fw-bold mb-2">Real-time Intelligence</h4>
            <p className="text-muted small mb-0">With live weather integration and 7-day prediction models, plan your routes wisely to avoid sudden monsoons.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
