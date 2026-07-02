import { getUploadUrl, getProfilePhoto } from '../../../../api';

export default function Sidebar({ 
  currentUser, 
  activeTab, 
  setActiveTab, 
  onLogout,
  unreadNotificationsCount,
  pendingBookingsCount
}) {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        <i className="bi bi-building-fill text-success me-2"></i>Provider Panel
      </div>
      <div className="text-center mb-4">
        <img 
          src={getProfilePhoto(currentUser.profile_photo)} 
          alt="Profile" 
          className="rounded-circle border-2 border-primary mb-2" 
          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
        />
        <h6 className="fw-bold mb-0 text-white">{currentUser.full_name}</h6>
        <span className="badge bg-primary rounded-pill px-2 py-1 mt-1 small">Service Provider</span>
      </div>
      <ul className="sidebar-menu">
        <li className={`sidebar-item ${activeTab === 'listings' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('listings'); }}>
            <i className="bi bi-card-list"></i> My Service Posts
          </a>
        </li>
        <li className={`sidebar-item ${activeTab === 'add_service' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('add_service'); }}>
            <i className="bi bi-plus-circle"></i> Create Offer Listing
          </a>
        </li>
        <li className={`sidebar-item ${activeTab === 'profile' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('profile'); }}>
            <i className="bi bi-person-circle"></i> Manage Profile
          </a>
        </li>
        <li className={`sidebar-item ${activeTab === 'bookings' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('bookings'); }}>
            <i className="bi bi-briefcase"></i> Incoming Bookings
            {pendingBookingsCount > 0 && (
              <span className="badge bg-warning text-dark rounded-pill ms-2" style={{ padding: '3px 6px' }}>{pendingBookingsCount}</span>
            )}
          </a>
        </li>
        <li className={`sidebar-item ${activeTab === 'notifications' ? 'active' : ''}`}>
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}>
            <i className="bi bi-bell-fill"></i> Notifications
            {unreadNotificationsCount > 0 && (
              <span className="badge bg-danger rounded-pill ms-2" style={{ padding: '3px 6px' }}>{unreadNotificationsCount}</span>
            )}
          </a>
        </li>
        <li className="sidebar-item mt-4 border-top pt-3">
          <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} className="text-danger fw-bold">
            <i className="bi bi-box-arrow-right text-danger"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  );
}
