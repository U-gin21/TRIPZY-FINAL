import React from 'react';

export default function TermsAndPrivacyModals() {
  return (
    <>
      {/* TERMS OF SERVICE MODAL */}
      <div 
        className="modal fade bg-dark bg-opacity-40" 
        id="tripzyTermsModal" 
        tabIndex="-1" 
        aria-labelledby="termsModalLabel" 
        aria-hidden="true" 
        style={{ backdropFilter: 'blur(3px)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-white">
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-file-earmark-text-fill text-primary fs-3"></i>
                <h4 className="modal-title fw-bold text-gradient" id="termsModalLabel">Terms & Conditions</h4>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div className="modal-body p-4 text-start text-dark" style={{ fontSize: '14.5px', lineHeight: '1.6' }}>
              <p className="text-muted small mb-4">Last updated: June 12, 2026</p>
              
              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">1. Agreement to Terms</h6>
                <p>Welcome to Tripzy Sri Lanka. By accessing or using our platform, website, or services, you agree to be bound by these Terms and Conditions. If you do not agree to all of these terms, you are prohibited from using the platform.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">2. Account Registration & Security</h6>
                <ul>
                  <li><strong>Eligibility:</strong> You must be at least 18 years of age to register an account on Tripzy. Underage registration is strictly prohibited.</li>
                  <li><strong>Information Accuracy:</strong> You agree to provide true, accurate, and current information during registration.</li>
                  <li><strong>Credential Security:</strong> You are responsible for safeguarding your login credentials and password. Tripzy cannot and will not be liable for any unauthorized access to your account.</li>
                </ul>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">3. Booking Model & Payments</h6>
                <p>Tripzy operates an <strong>Offline Payment Model</strong>. Stays, vehicles, guides, or camping gear booked on this website are reservations only. No payment transactions are processed online or stored on our servers. You agree to pay the respective Service Provider in person, directly at the location, utilizing cash or standard card payment methods upon service initiation.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">4. Cancellations, Disputes & Liability</h6>
                <p>Each service provider operates their own cancellation policy. Tripzy acts solely as a digital booking directory and intermediary hub. Tripzy is not liable or responsible for any cancellations, booking modifications, pricing changes, or travel disputes between the tourist and the service provider.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">5. Travel Companion Conduct</h6>
                <p>When participating in the <em>Travel Companion Finder</em> module, you agree to treat other travelers and members with respect. Harassment, discrimination, abusive behavior, or failure to fulfill shared transport expenses may result in permanent suspension of your Tripzy account.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">6. Limitation of Liability</h6>
                <p>In no event shall Tripzy Sri Lanka, its developers, or its partners be liable for any direct, indirect, incidental, or consequential damages (including travel delay, injury, loss of property, or personal emergencies) arising out of your tour arrangements or service bookings.</p>
              </section>
            </div>
            
            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-gradient rounded-pill px-4 w-100" data-bs-dismiss="modal">
                I Understand & Accept
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVACY POLICY MODAL */}
      <div 
        className="modal fade bg-dark bg-opacity-40" 
        id="tripzyPrivacyModal" 
        tabIndex="-1" 
        aria-labelledby="privacyModalLabel" 
        aria-hidden="true" 
        style={{ backdropFilter: 'blur(3px)' }}
      >
        <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-white">
            <div className="modal-header border-0 pb-0 pt-4 px-4 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <i className="bi bi-shield-fill-check text-primary fs-3"></i>
                <h4 className="modal-title fw-bold text-gradient" id="privacyModalLabel">Privacy Policy</h4>
              </div>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div className="modal-body p-4 text-start text-dark" style={{ fontSize: '14.5px', lineHeight: '1.6' }}>
              <p className="text-muted small mb-4">Last updated: June 12, 2026</p>
              
              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">1. Information We Collect</h6>
                <p>We collect personal information necessary to deliver travel services and manage your safety. This includes:</p>
                <ul>
                  <li><strong>Account Profile details:</strong> Full name, name with initials, email address, phone number, gender, date of birth, and optional profile photograph.</li>
                  <li><strong>Identity Verification:</strong> NIC (National Identity Card) or Passport number (mandatory for guides, service providers, and administrators to verify status).</li>
                </ul>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">2. How We Use Your Data</h6>
                <p>We process your information to fulfill the following objectives:</p>
                <ul>
                  <li>Processing service listings reservations and sending email notification confirmations.</li>
                  <li>Connecting you with verified travel companions when you request or post a trip plan.</li>
                  <li>Reviewing and approving administrator or service provider registration applications.</li>
                </ul>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">3. Information Sharing and Disclosure</h6>
                <p>Tripzy respects your privacy. We do not sell or lease your personal details to third-party advertising companies. Your booking details and contact number are shared exclusively with the specific hotel, guide, or vehicle operator you have reserved to facilitate your travel arrangements.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">4. Data Protection & Security</h6>
                <p>We implement technical protocols to safeguard your personal data. All user passwords are encrypted using secure cryptographic hashing algorithms. Since we do not process credit cards or online payments, your sensitive financial information is never collected or stored on our servers.</p>
              </section>

              <section className="mb-4">
                <h6 className="fw-bold text-secondary mb-2">5. Cookies and Session Management</h6>
                <p>Tripzy uses local session cookies to keep you logged in to your dashboard and preserve search filter choices. You can disable cookies in your browser settings, though doing so may log you out of your account on page refresh.</p>
              </section>
            </div>
            
            <div className="modal-footer border-0 pt-0 pb-4 px-4">
              <button type="button" className="btn btn-gradient rounded-pill px-4 w-100" data-bs-dismiss="modal">
                Close Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
