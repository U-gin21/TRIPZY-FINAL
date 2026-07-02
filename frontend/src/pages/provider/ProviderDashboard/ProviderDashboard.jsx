import React, { useEffect, useState } from 'react';
import { providerApi } from './providerApi';

// Components
import Sidebar from './components/Sidebar';
import ListingsTab from './components/ListingsTab';
import AddServiceTab from './components/AddServiceTab';
import ProfileTab from './components/ProfileTab';
import BookingsTab from './components/BookingsTab';
import CustomerDetailsModal from './components/CustomerDetailsModal';
import NotificationsTab from '../../../components/common/NotificationsTab';

export default function ProviderDashboard({ 
  currentUser, 
  onProfileUpdate, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  showConfirm 
}) {
  const [listings, setListings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Selected Booking Customer Details Modal
  const [selectedCust, setSelectedCust] = useState(null);

  useEffect(() => {
    fetchListings();
    fetchBookings();
    fetchNotifications();
  }, []);

  const fetchListings = async () => {
    try {
      const listings = await providerApi.fetchListings();
      setListings(listings);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const bookings = await providerApi.fetchBookings();
      setBookings(bookings);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifications = await providerApi.fetchNotifications();
      setNotifications(notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* SIDEBAR */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        unreadNotificationsCount={notifications.filter(n => !n.is_read || n.is_read == '0').length}
        pendingBookingsCount={bookings.filter(b => b.status === 'pending').length}
      />

      {/* CONTENT REGION */}
      <div className="dashboard-content animate-fade-in">
        {activeTab === 'listings' && (
          <ListingsTab 
            listings={listings} 
            fetchListings={fetchListings} 
            showConfirm={showConfirm} 
          />
        )}

        {activeTab === 'add_service' && (
          <AddServiceTab 
            currentUser={currentUser} 
            setActiveTab={setActiveTab} 
            fetchListings={fetchListings} 
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            currentUser={currentUser} 
            onProfileUpdate={onProfileUpdate} 
            listings={listings} 
            bookings={bookings} 
          />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings} 
            setSelectedCust={setSelectedCust} 
            fetchBookings={fetchBookings} 
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab 
            notifications={notifications} 
            onRefresh={fetchNotifications}
          />
        )}
      </div>

      {/* MODAL */}
      <CustomerDetailsModal selectedCust={selectedCust} />
    </div>
  );
}
