import React from 'react';

export default function VerifyOtpForm({
  resetToken,
  setResetToken,
  handleVerifyToken,
  loading,
  setVerifyMode,
  setForgotMode
}) {
  return (
    <form onSubmit={handleVerifyToken}>
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Verify OTP</h2>
        <p className="text-muted">Enter the 6-digit verification code</p>
      </div>
      
      <p className="text-muted small mb-4">Enter the 6-digit code that was sent to your email address.</p>
      
      <div className="mb-4">
        <label className="form-label small fw-semibold text-secondary mb-2">Verification Token</label>
        <div className="custom-input-group">
          <span className="input-icon">
            <i className="bi bi-shield-check"></i>
          </span>
          <input
            type="text"
            className="form-control text-center fw-bold fs-5"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
            placeholder="123456"
            maxLength="6"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" 
        style={{ borderRadius: '12px', background: 'var(--primary-color)' }} 
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Verify OTP'}
      </button>
      
      <div className="text-center mt-3">
        <button 
          type="button" 
          className="btn btn-link text-decoration-none small text-secondary fw-bold" 
          onClick={() => { 
            setVerifyMode(false); 
            setForgotMode(true); 
          }}
        >
          Back to Email
        </button>
      </div>
    </form>
  );
}
