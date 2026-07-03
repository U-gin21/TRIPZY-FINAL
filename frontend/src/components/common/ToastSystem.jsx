import React from 'react';

export default function ToastSystem({ toasts, onCloseToast }) {
  return (
    <div className="toast-container-custom">
      {toasts.map((t) => (
        <div key={t.id} className={`toast-custom toast-${t.type} animate-slide-in`}>
          <div className="toast-icon">
            {t.type === 'success' && <i className="bi bi-check-circle-fill"></i>}
            {t.type === 'error' && <i className="bi bi-x-circle-fill"></i>}
            {t.type === 'warning' && <i className="bi bi-exclamation-triangle-fill"></i>}
            {t.type === 'info' && <i className="bi bi-info-circle-fill"></i>}
          </div>
          <div className="toast-content">
            <span className="toast-message">{t.message}</span>
          </div>
          <button 
            className="toast-close-btn" 
            onClick={() => onCloseToast(t.id)}
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      ))}
    </div>
  );
}
