import React from 'react';

export default function ResetPasswordForm({
  newPassword,
  setNewPassword,
  handleResetPassword,
  loading
}) {
  return (
    <form onSubmit={handleResetPassword}>
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Reset Password</h2>
        <p className="text-muted">Enter a new secure password</p>
      </div>
      
      <p className="text-muted small mb-4">Verification successful. Enter a new password for your account.</p>
      
      <div className="mb-4">
        <label className="form-label small fw-semibold text-secondary mb-2">New Secure Password</label>
        <div className="custom-input-group">
          <span className="input-icon">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type="password"
            name="password"
            autocomplete="new-password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="Minimum 6 characters"
          />
        </div>
      </div>
      
      <button 
        type="submit" 
        className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" 
        style={{ borderRadius: '12px', background: 'var(--primary-color)' }} 
        disabled={loading}
      >
        {loading ? 'Resetting...' : 'Update Password'}
      </button>
    </form>
  );
}
