import React from 'react';

export default function CustomModal({ modalState }) {
  if (!modalState.show) return null;

  return (
    <div className="custom-modal-backdrop animate-fade-in" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(5, 25, 44, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div className="card glass-card p-4 text-center shadow-lg border border-light animate-slide-in" style={{
        maxWidth: '400px',
        width: '90%',
        background: 'var(--glass-bg)',
        borderRadius: '24px'
      }}>
        <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style={{
          width: '60px',
          height: '60px',
          background: modalState.severity === 'success' ? 'rgba(0, 154, 167, 0.1)' :
                      modalState.severity === 'error' ? 'rgba(239, 68, 68, 0.1)' :
                      modalState.severity === 'warning' ? 'rgba(255, 159, 28, 0.1)' :
                      'rgba(12, 50, 84, 0.1)',
          color: modalState.severity === 'success' ? 'var(--primary-color)' :
                 modalState.severity === 'error' ? '#ef4444' :
                 modalState.severity === 'warning' ? 'var(--accent-color)' :
                 'var(--secondary-color)'
        }}>
          {modalState.severity === 'success' && <i className="bi bi-check-circle fs-3"></i>}
          {modalState.severity === 'error' && <i className="bi bi-x-circle fs-3"></i>}
          {modalState.severity === 'warning' && <i className="bi bi-exclamation-triangle fs-3"></i>}
          {modalState.severity === 'info' && <i className="bi bi-info-circle fs-3"></i>}
        </div>
        <h4 className="fw-bold mb-2 text-gradient">{modalState.title}</h4>
        <p className="text-muted small mb-4">{modalState.message}</p>
        <div className="d-flex gap-2">
          {modalState.type === 'confirm' && (
            <button 
              className="btn btn-light rounded-pill flex-grow-1 py-2 fw-semibold" 
              onClick={modalState.onCancel}
            >
              Cancel
            </button>
          )}
          <button 
            className="btn btn-gradient rounded-pill flex-grow-1 py-2 fw-semibold" 
            onClick={modalState.onConfirm}
          >
            {modalState.type === 'confirm' ? 'Confirm' : 'OK'}
          </button>
        </div>
      </div>
    </div>
  );
}
