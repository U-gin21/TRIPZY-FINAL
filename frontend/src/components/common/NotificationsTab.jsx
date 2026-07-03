import React, { useState } from 'react';
import { apiRequest } from '../../api';

export default function NotificationsTab({ notifications, onRefresh }) {
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'
  const [markingAll, setMarkingAll] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleMarkRead = async (id) => {
    setLoadingId(id);
    try {
      await apiRequest('notifications', 'mark_read', 'POST', { id });
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await apiRequest('notifications', 'mark_all_read', 'POST');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await apiRequest('notifications', 'delete', 'POST', { id });
      if (onRefresh) await onRefresh();
      if (window.showToast) {
        window.showToast("Notification deleted successfully.", "success");
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
      if (window.showToast) {
        window.showToast("Failed to delete notification.", "error");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    setClearingAll(true);
    try {
      await apiRequest('notifications', 'clear_all', 'POST');
      if (onRefresh) await onRefresh();
      if (window.showToast) {
        window.showToast("All notifications cleared successfully.", "success");
      }
    } catch (err) {
      console.error("Failed to clear all notifications:", err);
      if (window.showToast) {
        window.showToast("Failed to clear all notifications.", "error");
      }
    } finally {
      setClearingAll(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Replace space with T to handle cross-browser Date parsing issues
    const date = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(date.getTime())) return dateStr;
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read || n.is_read == '0';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read || n.is_read == '0').length;

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold text-gradient mb-1">Notification Center</h2>
          <p className="text-muted small mb-0">Stay updated with copies of emails sent directly to your account.</p>
        </div>
        
        <div className="d-flex gap-2">
          {unreadCount > 0 && (
            <button 
              className="btn btn-gradient rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={handleMarkAllRead}
              disabled={markingAll}
            >
              {markingAll ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-envelope-open-fill"></i>
              )}
              Mark All as Read
            </button>
          )}

          {notifications.length > 0 && (
            <button 
              className="btn btn-outline-danger rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-2"
              onClick={handleClearAll}
              disabled={clearingAll}
            >
              {clearingAll ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-trash3-fill"></i>
              )}
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="card glass-card border-0 p-4 shadow-sm">
        {/* Filters */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div className="btn-group btn-group-sm rounded-pill p-1 bg-light shadow-inner" role="group">
            <button 
              type="button" 
              className={`btn rounded-pill px-3 py-1.5 transition-all ${filter === 'all' ? 'btn-primary text-white shadow-sm' : 'btn-light border-0 text-secondary'}`}
              onClick={() => setFilter('all')}
              style={filter === 'all' ? { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
            >
              All ({notifications.length})
            </button>
            <button 
              type="button" 
              className={`btn rounded-pill px-3 py-1.5 transition-all ${filter === 'unread' ? 'btn-primary text-white shadow-sm' : 'btn-light border-0 text-secondary'}`}
              onClick={() => setFilter('unread')}
              style={filter === 'unread' ? { backgroundColor: 'var(--primary-color)', borderColor: 'var(--primary-color)' } : {}}
            >
              Unread ({unreadCount})
            </button>
          </div>
          <span className="text-secondary small fw-bold">
            {unreadCount} new alerts
          </span>
        </div>

        {/* List */}
        <div className="d-flex flex-column gap-3" style={{ maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map(n => {
              const isUnread = !n.is_read || n.is_read == '0';
              return (
                <div 
                  className={`d-flex align-items-start justify-content-between gap-3 p-3 rounded-3 shadow-sm transition-all notification-card ${
                    isUnread 
                      ? 'bg-white border-start border-4 border-primary position-relative cursor-pointer' 
                      : 'bg-light bg-opacity-70 border-start border-4 border-secondary opacity-75'
                  }`}
                  key={n.id}
                  onClick={() => isUnread && handleMarkRead(n.id)}
                  title={isUnread ? "Click to mark as read" : ""}
                  style={{
                    cursor: isUnread ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="d-flex gap-3 align-items-start">
                    <div className={`p-2 rounded-circle ${isUnread ? 'bg-primary bg-opacity-10 text-primary' : 'bg-secondary bg-opacity-10 text-secondary'}`}>
                      <i className={`bi ${isUnread ? 'bi-bell-fill fs-5' : 'bi-bell fs-5'}`}></i>
                    </div>
                    <div>
                      <p className={`mb-1 text-dark text-break ${isUnread ? 'fw-bold' : ''}`} style={{ fontSize: '13.5px' }}>
                        {n.message}
                      </p>
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted" style={{ fontSize: '11px' }}>
                          <i className="bi bi-clock me-1"></i>
                          {formatDate(n.created_at)}
                        </span>
                        {isUnread && (
                          <span className="badge bg-primary rounded-pill" style={{ fontSize: '9px', padding: '3px 8px' }}>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2 ms-2">
                    {isUnread && (
                      <button
                        className="btn btn-sm btn-outline-primary rounded-circle p-1 d-flex align-items-center justify-content-center text-decoration-none border-0"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card click bubble
                          handleMarkRead(n.id);
                        }}
                        disabled={loadingId === n.id}
                        title="Mark as read"
                        style={{ width: '28px', height: '28px' }}
                      >
                        {loadingId === n.id ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }}></span>
                        ) : (
                          <i className="bi bi-check-lg fs-5"></i>
                        )}
                      </button>
                    )}

                    <button
                      className="btn btn-sm btn-outline-danger rounded-circle p-1 d-flex align-items-center justify-content-center text-decoration-none border-0"
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card click bubble
                        handleDelete(n.id);
                      }}
                      disabled={deletingId === n.id}
                      title="Delete notification"
                      style={{ width: '28px', height: '28px' }}
                    >
                      {deletingId === n.id ? (
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" style={{ width: '12px', height: '12px' }}></span>
                      ) : (
                        <i className="bi bi-trash fs-5"></i>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-5">
              <div className="display-4 text-muted mb-3">
                <i className="bi bi-bell-slash text-secondary opacity-50"></i>
              </div>
              <h5 className="fw-bold text-dark">No Notifications</h5>
              <p className="text-muted small px-3">
                {filter === 'unread' 
                  ? "You have read all of your notifications." 
                  : "You don't have any notifications yet. When you receive emails from Tripzy, they will appear here."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
