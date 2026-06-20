import React from 'react';

export default function RegisterForm({
  userType,
  setUserType,
  fullName,
  setFullName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  dob,
  setDob,
  gender,
  setGender,
  nicPassport,
  setNicPassport,
  contactNo,
  setContactNo,
  agreeToTerms,
  setAgreeToTerms,
  handleRegister,
  loading,
  setIsLogin,
  profilePhoto,
  setProfilePhoto
}) {
  return (
    <form onSubmit={handleRegister}>
      <div className="text-center mb-4">
        <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Create Your Account</h2>
        <p className="text-muted">Join Tripzy and start your curated Sri Lankan journey today.</p>
      </div>

      {/* Role selection cards */}
      <div className="row g-3 mb-4">
        {/* I am a Tourist */}
        <div className="col-md-4">
          <div 
            className={`role-card ${userType === 'tourist' ? 'selected-tourist' : ''}`}
            onClick={() => setUserType('tourist')}
          >
            {userType === 'tourist' && (
              <span className="role-card-badge-tourist">
                <i className="bi bi-check-circle-fill"></i>
              </span>
            )}
            <div className="role-icon-container role-icon-tourist">
              <i className="bi bi-globe-asia-australia"></i>
            </div>
            <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am a Tourist</h6>
            <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Plan your perfect island getaway</p>
          </div>
        </div>

        {/* I am a Service Provider */}
        <div className="col-md-4">
          <div 
            className={`role-card ${userType === 'provider' ? 'selected-provider' : ''}`}
            onClick={() => setUserType('provider')}
          >
            {userType === 'provider' && (
              <span className="role-card-badge-provider">
                <i className="bi bi-check-circle-fill"></i>
              </span>
            )}
            <div className="role-icon-container role-icon-provider">
              <i className="bi bi-briefcase"></i>
            </div>
            <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am a Service Provider</h6>
            <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Offer experiences and grow your business</p>
          </div>
        </div>

        {/* I am an Admin */}
        <div className="col-md-4">
          <div 
            className={`role-card ${userType === 'admin' ? 'selected-admin' : ''}`}
            onClick={() => setUserType('admin')}
          >
            {userType === 'admin' && (
              <span className="role-card-badge-admin">
                <i className="bi bi-check-circle-fill"></i>
              </span>
            )}
            <div className="role-icon-container role-icon-admin">
              <i className="bi bi-shield"></i>
            </div>
            <h6 className="fw-bold mb-1" style={{ fontSize: '14px', color: '#1e293b' }}>I am an Admin</h6>
            <p className="text-muted mb-0" style={{ fontSize: '11px', lineHeight: '1.3' }}>Manage platform operations and approvals</p>
          </div>
        </div>
      </div>

      {/* Form fields grid */}
      <div className="row g-3 mb-4">
        {/* Full Name */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Full Name</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-person"></i>
            </span>
            <input
              type="text"
              name="full_name"
              autocomplete="name"
              className="form-control"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Email Address</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-envelope"></i>
            </span>
            <input
              type="email"
              name="email"
              autocomplete="username"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="john@example.com"
            />
          </div>
        </div>

        {/* Password */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Password</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-lock"></i>
            </span>
            <input
              type="password"
              name="password"
              autocomplete="new-password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Confirm Password</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-arrow-counterclockwise"></i>
            </span>
            <input
              type="password"
              name="confirm_password"
              autocomplete="new-password"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>
        </div>

        {/* Date of Birth */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Date of Birth</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-calendar3"></i>
            </span>
            <input
              type="date"
              name="dob"
              autocomplete="bday"
              className="form-control"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Gender selection */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Gender</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-gender-ambiguous"></i>
            </span>
            <select className="form-select" name="gender" autocomplete="sex" value={gender} onChange={(e) => setGender(e.target.value)} required>
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* NIC / Passport */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">NIC / Passport Number</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-card-text"></i>
            </span>
            <input
              type="text"
              name="nic_passport"
              autocomplete="off"
              className="form-control"
              value={nicPassport}
              onChange={(e) => setNicPassport(e.target.value)}
              required
              placeholder="ID Card or Passport"
            />
          </div>
        </div>

        {/* Contact Number */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Contact Number</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-telephone"></i>
            </span>
            <input
              type="tel"
              name="contact_no"
              autocomplete="tel"
              className="form-control"
              value={contactNo}
              onChange={(e) => setContactNo(e.target.value)}
              required
              placeholder="+94 XX XXX XXXX"
            />
          </div>
        </div>

        {/* Profile Photo */}
        <div className="col-md-6">
          <label className="form-label small fw-semibold text-secondary mb-2">Profile Photo (Optional)</label>
          <div className="custom-input-group">
            <span className="input-icon">
              <i className="bi bi-image"></i>
            </span>
            <input
              type="file"
              name="profile_photo"
              className="form-control"
              accept="image/*"
              onChange={(e) => setProfilePhoto(e.target.files[0] || null)}
            />
          </div>
        </div>
      </div>

      {/* Terms agreement checkbox */}
      <div className="form-check mb-4 d-flex align-items-start gap-2">
        <input
          type="checkbox"
          className="form-check-input border-secondary mt-1"
          id="termsCheck"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          required
          style={{ cursor: 'pointer' }}
        />
        <label className="form-check-label small text-muted" htmlFor="termsCheck" style={{ cursor: 'pointer', userSelect: 'none' }}>
          I agree to the <a href="#" className="text-decoration-none text-primary hover-text-primary fw-semibold" data-bs-toggle="modal" data-bs-target="#tripzyTermsModal">Terms of Service</a> and <a href="#" className="text-decoration-none text-primary hover-text-primary fw-semibold" data-bs-toggle="modal" data-bs-target="#tripzyPrivacyModal">Privacy Policy</a> of Tripzy Sri Lanka.
        </label>
      </div>

      <div className="text-center">
        <button type="submit" className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" style={{ borderRadius: '12px', background: 'var(--primary-color)' }} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Creating Account...
            </>
          ) : 'Create Account'}
        </button>

        <div className="mt-3">
          <span className="text-muted small">Already have an account? </span>
          <button type="button" className="btn btn-link p-0 text-decoration-none small fw-bold text-primary hover-text-primary" onClick={() => setIsLogin(true)}>
            Log In
          </button>
        </div>
      </div>
    </form>
  );
}
