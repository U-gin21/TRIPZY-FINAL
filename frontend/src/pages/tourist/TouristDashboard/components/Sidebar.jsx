import { getUploadUrl, getProfilePhoto } from '../../../../api';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  unreadNotificationsCount,
  pendingCompanionsCount,
  isSidebarOpen,
  onClose
}) {
  const handleItemClick = (tab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'show' : ''}`}>
      {/* Fixed Top Brand & Profile */}
      <div className="sidebar-brand d-flex justify-content-between align-items-center">
        <span><i className="bi bi-person-circle text-primary me-2"></i>Tourist Panel</span>
        <button 
          className="btn btn-link text-white p-0 d-lg-none border-0" 
          onClick={onClose}
          aria-label="Close Sidebar"
        >
          <i className="bi bi-x-lg fs-4"></i>
        </button>
      </div>
      
      <div className="sidebar-profile">
        <img 
          src={getProfilePhoto(currentUser.profile_photo)} 
          alt="Profile" 
          className="rounded-circle mb-2" 
        />
        <h6 className="fw-bold mb-0">{currentUser.full_name}</h6>
        <span className="badge bg-success rounded-pill mt-1">Tourist</span>
      </div>

      {/* Scrollable middle options */}
      <div className="sidebar-menu-container">
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('bookings'); }}>
              <i className="bi bi-calendar-check"></i> Bookings & History
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'services' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('services'); }}>
              <i className="bi bi-shop"></i> Book Services
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'companion' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('companion'); }}>
              <i className="bi bi-people"></i> My Companions
              {pendingCompanionsCount > 0 && (
                <span className="badge bg-warning text-dark rounded-pill ms-2" style={{ padding: '3px 6px' }}>{pendingCompanionsCount}</span>
              )}
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('profile'); }}>
              <i className="bi bi-person-fill-gear"></i> Manage Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('notifications'); }}>
              <i className="bi bi-bell-fill"></i> Notifications
              {unreadNotificationsCount > 0 && (
                <span className="badge bg-danger rounded-pill ms-2" style={{ padding: '3px 6px' }}>{unreadNotificationsCount}</span>
              )}
            </a>
          </li>
        </ul>
      </div>

      {/* Fixed bottom logout */}
      <div className="sidebar-logout">
        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); if (onClose) onClose(); }} className="text-danger fw-bold">
          <i className="bi bi-box-arrow-right text-danger"></i> Logout
        </a>
      </div>
    </div>
  );
}
