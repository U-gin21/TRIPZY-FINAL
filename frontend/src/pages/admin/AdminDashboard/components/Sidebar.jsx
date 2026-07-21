import { getUploadUrl, getProfilePhoto } from '../../../../api';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  unreadNotificationsCount,
  pendingApprovalsCount,
  pendingFaqsCount,
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
        <span><i className="bi bi-shield-lock-fill text-danger me-2"></i>Admin Panel</span>
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
        <span className="badge bg-danger rounded-pill mt-1">Admin</span>
      </div>

      {/* Scrollable middle options */}
      <div className="sidebar-menu-container">
        <ul className="sidebar-menu">
          <li className={`sidebar-item ${activeTab === 'stats' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('stats'); }}>
              <i className="bi bi-graph-up-arrow"></i> System Statistics
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'approvals' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('approvals'); }}>
              <i className="bi bi-check2-all"></i> Pending Approvals
              {pendingApprovalsCount > 0 && (
                <span className="badge bg-warning text-dark rounded-pill ms-2" style={{ padding: '3px 6px' }}>{pendingApprovalsCount}</span>
              )}
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'destinations' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('destinations'); }}>
              <i className="bi bi-geo-alt-fill"></i> Destinations
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'faqs' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('faqs'); }}>
              <i className="bi bi-question-circle"></i> FAQs Manage
              {pendingFaqsCount > 0 && (
                <span className="badge bg-warning text-dark rounded-pill ms-2" style={{ padding: '3px 6px' }}>{pendingFaqsCount}</span>
              )}
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('profile'); }}>
              <i className="bi bi-person-circle"></i> Profile
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('bookings'); }}>
              <i className="bi bi-collection-fill"></i> Monitor Bookings
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'users' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('users'); }}>
              <i className="bi bi-people-fill"></i> Manage Users
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'inquiries' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('inquiries'); }}>
              <i className="bi bi-envelope-paper-fill"></i> Contact Inquiries
            </a>
          </li>
          <li className={`sidebar-item ${activeTab === 'companions' ? 'active' : ''}`}>
            <a href="#" onClick={(e) => { e.preventDefault(); handleItemClick('companions'); }}>
              <i className="bi bi-postcard-fill"></i> Companion Finder
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
