import React from 'react';

export default function LoginForm({
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  handleLogin,
  setForgotMode,
  setIsLogin,
  setResetEmail,
  loading
}) {
  return (
    <form onSubmit={handleLogin}>
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-2" style={{ color: '#035a56', fontSize: '2rem' }}>Login to Tripzy</h2>
        <p className="text-muted">Smart Tourism Management & Booking System</p>
      </div>

      <div className="mb-4">
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
            value={loginEmail}
            onChange={(e) => setLoginEmail(e.target.value)}
            required
            placeholder="name@example.com"
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label small fw-semibold text-secondary mb-2">Password</label>
        <div className="custom-input-group">
          <span className="input-icon">
            <i className="bi bi-lock"></i>
          </span>
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            className="form-control"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            placeholder="Enter password"
          />
        </div>
      </div>

      <div className="text-end mb-4">
        <button 
          type="button" 
          className="btn btn-link p-0 text-decoration-none small text-muted hover-text-primary" 
          onClick={() => { 
            setForgotMode(true); 
            setIsLogin(false); 
            setResetEmail(loginEmail); 
          }}
        >
          Forgot Password?
        </button>
      </div>

      <button 
        type="submit" 
        className="btn btn-gradient w-100 py-3 mb-3 fw-bold fs-6" 
        style={{ borderRadius: '12px', background: 'var(--primary-color)' }} 
        disabled={loading}
      >
        {loading ? 'Verifying...' : 'Login'}
      </button>

      <div className="text-center mt-3">
        <span className="text-muted small">Don't have an account? </span>
        <button 
          type="button" 
          className="btn btn-link p-0 text-decoration-none small fw-bold text-primary hover-text-primary" 
          onClick={() => setIsLogin(false)}
        >
          Register
        </button>
      </div>
    </form>
  );
}
