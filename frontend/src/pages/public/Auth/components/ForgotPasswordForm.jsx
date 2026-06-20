import React from 'react';

export default function ForgotPasswordForm({
  resetEmail,
  setResetEmail,
  handleForgotPassword,
  loading,
  setForgotMode,
  setIsLogin
}) {
  return (
    <form onSubmit={handleForgotPassword}>
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Forgot Password</h2>
        <p className="text-muted">Enter the email address used for your Tripzy login.</p>
      </div>
      
      <p className="text-muted small mb-4">We will send a 6-digit OTP to that same email so you can verify and reset your password.</p>
      
      <div className="mb-4">
        <label className="form-label small fw-semibold text-secondary mb-2">Email Address</label>
        <div className="custom-input-group">
          <span className="input-icon">
            <i className="bi bi-envelope"></i>
          </span>
          <input
            type="email"
            className="form-control"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            required
            placeholder="Enter registered email address"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" 
        style={{ borderRadius: '12px', background: 'var(--primary-color)' }} 
        disabled={loading}
      >
        {loading ? 'Sending...' : 'Send Verification Token'}
      </button>
      
      <div className="text-center mt-3">
        <button 
          type="button" 
          className="btn btn-link text-decoration-none small text-secondary fw-bold" 
          onClick={() => { 
            setForgotMode(false); 
            setIsLogin(true); 
          }}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}
