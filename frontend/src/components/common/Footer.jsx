import React from 'react';
import logo from '../../assets/logo.png';

export default function Footer({ onNavigate }) {
  return (
    <footer className="footer-premium text-white pt-5 pb-4 mt-5">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Column 1: Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <img src={logo} alt="Tripzy Logo" style={{ height: '45px', width: 'auto' }} />
              <h3 className="fw-bold text-gradient mb-0" style={{ letterSpacing: '0.5px' }}>Tripzy</h3>
            </div>
            <p className="text-white-50 small mb-4" style={{ lineHeight: '1.6' }}>
              Tripzy is Sri Lanka's smart digital tourism management and booking ecosystem. 
              We connect travelers with verified local service providers, fostering community-driven 
              hospitality and providing a risk-free offline payment environment.
            </p>
            {/* Social Media Links */}
            <div className="d-flex gap-3">
              <a href="#" className="social-icon-btn" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="social-icon-btn" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="social-icon-btn" aria-label="YouTube">
                <i className="bi bi-youtube"></i>
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="col-lg-3 col-md-6 offset-lg-1">
            <h5 className="fw-bold text-white mb-4 position-relative footer-heading">Quick Links</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-white-50 small">
              <li>
                <a href="#" className="footer-link d-flex align-items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>
                  <i className="bi bi-chevron-right small"></i> Home
                </a>
              </li>
              <li>
                <a href="#" className="footer-link d-flex align-items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('explore'); }}>
                  <i className="bi bi-chevron-right small"></i> Explore Destinations
                </a>
              </li>
              <li>
                <a href="#" className="footer-link d-flex align-items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('companions'); }}>
                  <i className="bi bi-chevron-right small"></i> Companion Finder
                </a>
              </li>
              <li>
                <a href="#" className="footer-link d-flex align-items-center gap-2" onClick={(e) => { e.preventDefault(); onNavigate('faqs'); }}>
                  <i className="bi bi-chevron-right small"></i> FAQ Help Center
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="col-lg-4 col-md-12">
            <h5 className="fw-bold text-white mb-4 position-relative footer-heading">Get in Touch</h5>
            <ul className="list-unstyled d-flex flex-column gap-3 text-white-50 small">
              <li className="d-flex align-items-start gap-3">
                <div className="contact-icon bg-white bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <span>Level 15, East Tower, World Trade Center, Colombo 01, Sri Lanka.</span>
              </li>
              <li className="d-flex align-items-center gap-3">
                <div className="contact-icon bg-white bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                  <i className="bi bi-telephone-fill"></i>
                </div>
                <span>+94 74 357 1412 / +94 77 516 3927</span>
              </li>
              <li className="d-flex align-items-center gap-3">
                <div className="contact-icon bg-white bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px', flexShrink: 0 }}>
                  <i className="bi bi-envelope-fill"></i>
                </div>
                <a href="mailto:support@tripzy.lk" className="text-white-50 text-decoration-none footer-link-email">support@tripzy.lk</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Copyright and Legal */}
        <div className="border-top border-white border-opacity-10 pt-4 mt-4">
          <div className="row align-items-center g-3">
            <div className="col-md-6 text-center text-md-start text-white-50 small">
              <p className="mb-0">&copy; {new Date().getFullYear()} Tripzy Sri Lanka (Smart Tourism System). All rights reserved.</p>
            </div>
            <div className="col-md-6 text-center text-md-end text-white-50 small">
              <a href="#" className="text-white-50 text-decoration-none me-3 footer-bottom-link" data-bs-toggle="modal" data-bs-target="#tripzyPrivacyModal">Privacy Policy</a>
              <span className="text-white-50 opacity-25">|</span>
              <a href="#" className="text-white-50 text-decoration-none ms-3 footer-bottom-link" data-bs-toggle="modal" data-bs-target="#tripzyTermsModal">Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
