import React, { useEffect, useState } from 'react';
import { getUploadUrl } from '../../../api';
import { adminApi } from './adminApi';

// Components
import Sidebar from './components/Sidebar';
import StatsTab from './components/StatsTab';
import ApprovalsTab from './components/ApprovalsTab';
import DestinationsTab from './components/DestinationsTab';
import FaqsTab from './components/FaqsTab';
import ProfileTab from './components/ProfileTab';
import BookingsTab from './components/BookingsTab';
import UsersTab from './components/UsersTab';
import NotificationsTab from '../../../components/common/NotificationsTab';

export default function AdminDashboard({ 
  currentUser, 
  onProfileUpdate, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  showConfirm 
}) {
  
  // Data states
  const [stats, setStats] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingProviders, setPendingProviders] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  const [selectedSummaryUser, setSelectedSummaryUser] = useState(null);
  const [approvingUsers, setApprovingUsers] = useState({});

  useEffect(() => {
    fetchStats();
    fetchPendingUsers();
    fetchDestinations();
    fetchFaqs();
    fetchBookings();
    fetchUsers();
    fetchNotifications();
  }, []);

  async function fetchStats() {
    try {
      const statsData = await adminApi.fetchStats();
      setStats(statsData);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchPendingUsers() {
    try {
      const data = await adminApi.fetchPendingUsers();
      setPendingAdmins(data.pendingAdmins);
      setPendingProviders(data.pendingProviders);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchDestinations() {
    try {
      const destinations = await adminApi.fetchDestinations();
      setDestinations(destinations);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchFaqs() {
    try {
      const faqsData = await adminApi.fetchFaqs();
      setFaqs(faqsData);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchBookings() {
    try {
      const bookingsData = await adminApi.fetchBookings();
      setBookings(bookingsData);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchUsers() {
    try {
      const usersData = await adminApi.fetchUsers();
      setUsers(usersData);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchNotifications() {
    try {
      const notificationsData = await adminApi.fetchNotifications();
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  }

  const handleToggleUserStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    const actionText = currentStatus === 'suspended' ? 'activate' : 'suspend';
    showConfirm(
      `Are you sure you want to ${actionText} this user's account?`,
      async () => {
        try {
          await adminApi.toggleUserStatus(id, nextStatus);
          alert(`User account has been successfully ${nextStatus === 'suspended' ? 'suspended' : 'activated'}.`);
          fetchUsers();
          fetchStats();
        } catch (err) {
          alert(err.message);
        }
      },
      `Confirm ${currentStatus === 'suspended' ? 'Activation' : 'Suspension'}`
    );
  };

  const handleApproveUser = async (id, status, type) => {
    setApprovingUsers((prev) => ({ ...prev, [id]: true }));
    try {
      await adminApi.approveUser(id, status);
      alert(`User status has been successfully set to ${status.toUpperCase()} and the user was notified.`);
      if (type === 'admin') {
        setPendingAdmins((prev) => prev.filter((user) => user.id !== id));
      } else if (type === 'provider') {
        setPendingProviders((prev) => prev.filter((user) => user.id !== id));
      }
      fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setApprovingUsers((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  // Filter bookings related to the selected user
  const userBookings = selectedSummaryUser ? bookings.filter(b => {
    if (selectedSummaryUser.user_type === 'tourist') {
      return Number(b.tourist_id) === Number(selectedSummaryUser.id);
    } else if (selectedSummaryUser.user_type === 'provider') {
      return Number(b.provider_id) === Number(selectedSummaryUser.id);
    }
    return false;
  }) : [];

  const completedBookings = userBookings.filter(b => b.status === 'completed');
  const totalFinancialAmount = completedBookings.reduce((sum, b) => sum + Number(b.price), 0);

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        unreadNotificationsCount={notifications.filter(n => !n.is_read || n.is_read == '0').length}
        pendingApprovalsCount={pendingAdmins.length + pendingProviders.length}
        pendingFaqsCount={faqs.filter(f => !f.answer || f.answer.trim() === '').length}
      />

      {/* ADMIN WORKSPACE */}
      <div className="dashboard-content animate-fade-in">
        {activeTab === 'stats' && (
          <StatsTab stats={stats} />
        )}

        {activeTab === 'approvals' && (
          <ApprovalsTab 
            pendingAdmins={pendingAdmins} 
            pendingProviders={pendingProviders} 
            handleApproveUser={handleApproveUser} 
            approvingUsers={approvingUsers}
          />
        )}

        {activeTab === 'destinations' && (
          <DestinationsTab 
            destinations={destinations} 
            fetchDestinations={fetchDestinations} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'faqs' && (
          <FaqsTab 
            faqs={faqs} 
            fetchFaqs={fetchFaqs} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            currentUser={currentUser} 
            onProfileUpdate={onProfileUpdate} 
            destinations={destinations} 
            faqs={faqs} 
            bookings={bookings} 
            pendingAdmins={pendingAdmins} 
            pendingProviders={pendingProviders} 
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} />
        )}

        {activeTab === 'users' && (
          <UsersTab 
            users={users} 
            handleToggleUserStatus={handleToggleUserStatus} 
            onViewUserSummary={setSelectedSummaryUser}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab 
            notifications={notifications} 
            onRefresh={fetchNotifications}
          />
        )}
      </div>

      {/* User Detail Summary Modal (declared at root to avoid stacking context issues) */}
      <div className="modal fade bg-dark bg-opacity-40" id="adminUserSummaryModal" tabIndex="-1" aria-hidden="true" style={{ backdropFilter: 'blur(3px)' }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content rounded-4 border-0 shadow-lg bg-white">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient">User Profile & Activity Summary</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={() => setSelectedSummaryUser(null)}></button>
            </div>
            <div className="modal-body p-4 text-center">
              {selectedSummaryUser ? (
                <div className="row g-4 text-dark text-start">
                  {/* Left Column: Personal info */}
                  <div className="col-md-5 border-end">
                    <div className="text-center mb-3">
                      <img
                        src={selectedSummaryUser.profile_photo && selectedSummaryUser.profile_photo !== 'default_profile.jpg' ? getUploadUrl(selectedSummaryUser.profile_photo) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={selectedSummaryUser.full_name}
                        className="rounded-circle mb-3 shadow"
                        style={{ width: '110px', height: '110px', objectFit: 'cover', border: '4px solid var(--primary-color)' }}
                      />
                      <h4 className="fw-bold mb-1">{selectedSummaryUser.full_name}</h4>
                      <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 fw-bold text-uppercase" style={{ fontSize: '11px' }}>
                        {selectedSummaryUser.user_type}
                      </span>
                    </div>

                    <div className="bg-light p-3 rounded-3">
                      <div className="mb-2">
                        <span className="small text-muted d-block">Name with Initial:</span>
                        <strong className="small">{selectedSummaryUser.name_with_initial || 'N/A'}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">Email Address:</span>
                        <strong className="small text-break">{selectedSummaryUser.email}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">NIC / Passport No:</span>
                        <strong className="small">{selectedSummaryUser.nic_passport}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">Contact No:</span>
                        <strong className="small">{selectedSummaryUser.contact_no}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">Gender:</span>
                        <strong className="small text-capitalize">{selectedSummaryUser.gender}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">Date of Birth:</span>
                        <strong className="small">{selectedSummaryUser.date_of_birth}</strong>
                      </div>
                      <div className="mb-2">
                        <span className="small text-muted d-block">Status:</span>
                        <span className={`badge bg-opacity-10 rounded-pill px-2 py-0.5 text-capitalize text-${selectedSummaryUser.status === 'active' ? 'success' : selectedSummaryUser.status === 'suspended' ? 'danger' : 'warning'}`} style={{ fontSize: '12px' }}>
                          {selectedSummaryUser.status}
                        </span>
                      </div>
                      <div>
                        <span className="small text-muted d-block">Member Since:</span>
                        <strong className="small">{new Date(selectedSummaryUser.created_at).toLocaleDateString()}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Booking History */}
                  <div className="col-md-7">
                    <h5 className="fw-bold text-gradient mb-3">
                      <i className="bi bi-journal-check me-2"></i>
                      {selectedSummaryUser.user_type === 'tourist' 
                        ? 'Booking Activity Summary' 
                        : selectedSummaryUser.user_type === 'admin' 
                          ? 'Administrative Activity Summary' 
                          : 'Service Listings Booking Activity'}
                    </h5>

                    {/* Booking Stats Cards */}
                    <div className="row g-2 mb-3">
                      <div className="col-4">
                        <div className="bg-light p-2 rounded text-center">
                          <span className="small text-muted d-block" style={{ fontSize: '10px' }}>Total Bookings</span>
                          <h4 className="fw-bold mb-0 text-primary">{userBookings.length}</h4>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-light p-2 rounded text-center">
                          <span className="small text-muted d-block" style={{ fontSize: '10px' }}>Completed</span>
                          <h4 className="fw-bold mb-0 text-success">{completedBookings.length}</h4>
                        </div>
                      </div>
                      <div className="col-4">
                        <div className="bg-light p-2 rounded text-center">
                          <span className="small text-muted d-block" style={{ fontSize: '10px' }}>
                            {selectedSummaryUser.user_type === 'tourist' 
                              ? 'Total Spent' 
                              : selectedSummaryUser.user_type === 'admin' 
                                ? 'Account Role' 
                                : 'Total Earnings'}
                          </span>
                          <h4 className="fw-bold mb-0 text-success text-capitalize" style={{ fontSize: '12px', marginTop: '6px', overflowWrap: 'anywhere' }}>
                            {selectedSummaryUser.user_type === 'admin' ? 'Admin' : `LKR ${totalFinancialAmount.toLocaleString()}`}
                          </h4>
                        </div>
                      </div>
                    </div>

                    {/* Bookings List */}
                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {userBookings.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm table-hover align-middle mb-0" style={{ fontSize: '11px' }}>
                            <thead className="table-light">
                              <tr>
                                <th>Ref No</th>
                                <th>Service Name</th>
                                <th>Dates</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userBookings.map(b => (
                                <tr key={b.id}>
                                  <td><strong className="text-primary">{b.ref_no}</strong></td>
                                  <td>{b.name_of_institute}</td>
                                  <td><span className="small text-muted">{b.start_date} to {b.end_date}</span></td>
                                  <td>LKR {Number(b.price).toLocaleString()}</td>
                                  <td>
                                    <span className={`badge bg-opacity-10 text-${b.status === 'completed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}`} style={{ fontSize: '9px' }}>
                                      {b.status.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-4 border rounded">
                          <i className="bi bi-calendar-x text-muted fs-3"></i>
                          <p className="small text-muted mb-0 mt-2">
                            {selectedSummaryUser.user_type === 'admin' 
                              ? 'Administrators do not manage bookings.' 
                              : 'No bookings logged for this user.'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-5 text-center">
                  <div className="spinner-border text-primary" role="status"></div>
                  <p className="text-muted mt-2 mb-0">Loading profile data...</p>
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-gradient rounded-pill px-4 w-100" data-bs-dismiss="modal" onClick={() => setSelectedSummaryUser(null)}>
                Close Summary
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
