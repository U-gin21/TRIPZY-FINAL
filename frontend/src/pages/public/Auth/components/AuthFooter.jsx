import React from 'react';

export default function AuthFooter({ logo }) {
  return (
    <footer className="py-4 mt-5 border-top border-light-subtle" style={{ width: '100%', zIndex: 2, background: 'transparent' }}>
      <div className="container">
        <div className="row align-items-center justify-content-between g-3">
          <div className="col-md-5 text-center text-md-start d-flex align-items-center justify-content-center justify-content-md-start gap-2">
            <img src={logo} alt="Tripzy Logo" style={{ height: '30px', width: 'auto' }} />
            <span className="fw-bold fs-5 text-gradient">Tripzy</span>
            <span className="text-muted small">&copy; {new Date().getFullYear()} Tripzy. All rights reserved.</span>
          </div>
          <div className="col-md-4 text-center">
            <div className="d-flex justify-content-center gap-3">
              <a href="#" className="text-muted text-decoration-none small hover-text-primary" data-bs-toggle="modal" data-bs-target="#tripzyPrivacyModal">Privacy Policy</a>
              <a href="#" className="text-muted text-decoration-none small hover-text-primary" data-bs-toggle="modal" data-bs-target="#tripzyTermsModal">Terms of Service</a>
              <a href="#" className="text-muted text-decoration-none small hover-text-primary" data-bs-toggle="modal" data-bs-target="#tripzyPrivacyModal">Cookie Policy</a>
              <a href="#" className="text-muted text-decoration-none small hover-text-primary" onClick={(e) => { e.preventDefault(); alert("For support, please contact us at support@tripzy.lk"); }}>Support</a>
            </div>
          </div>
          <div className="col-md-3 text-center text-md-end">
            <div className="d-flex justify-content-center justify-content-md-end gap-3">
              <a href="#" className="text-muted hover-text-primary"><i className="bi bi-globe fs-5"></i></a>
              <a href="#" className="text-muted hover-text-primary"><i className="bi bi-instagram fs-5"></i></a>
              <a href="#" className="text-muted hover-text-primary"><i className="bi bi-envelope fs-5"></i></a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
