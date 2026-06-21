import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Public Pages
import Home from '../pages/public/Home/Home';
import Explore from '../pages/public/Explore/Explore';
import CompanionFinder from '../pages/public/CompanionFinder/CompanionFinder';
import AboutUs from '../pages/public/AboutUs/AboutUs';
import FAQs from '../pages/public/FAQs/FAQs';
import ContactUs from '../pages/public/ContactUs/ContactUs';
import Auth from '../pages/public/Auth/Auth';

// Dashboards
import TouristDashboard from '../pages/tourist/TouristDashboard/TouristDashboard';
import ProviderDashboard from '../pages/provider/ProviderDashboard/ProviderDashboard';
import AdminDashboard from '../pages/admin/AdminDashboard/AdminDashboard';

export default function AppRoutes({
  currentUser,
  setCurrentUser,
  navigate,
  authMode,
  dashboardIntent,
  activeTab,
  setActiveTab,
  showConfirm,
  handleLogout
}) {
  const reactNavigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home onNavigate={navigate} currentUser={currentUser} />} />
      <Route path="/home" element={<Home onNavigate={navigate} currentUser={currentUser} />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/companions" element={<CompanionFinder currentUser={currentUser} onNavigate={navigate} />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/faqs" element={<FAQs currentUser={currentUser} onNavigate={navigate} />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route
        path="/auth"
        element={
          currentUser ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Auth
              initialMode={authMode}
              onLoginSuccess={(user) => {
                localStorage.setItem('tripzy_logged_in', 'true');
                sessionStorage.setItem('tripzy_session_active', 'true');
                setCurrentUser(user);
                reactNavigate('/dashboard');
              }}
            />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          currentUser ? (
            <>
              {currentUser.user_type === 'tourist' && (
                <TouristDashboard
                  currentUser={currentUser}
                  onProfileUpdate={setCurrentUser}
                  initialServiceType={dashboardIntent?.serviceType}
                  onLogout={handleLogout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showConfirm={showConfirm}
                />
              )}
              {currentUser.user_type === 'provider' && (
                <ProviderDashboard
                  currentUser={currentUser}
                  onProfileUpdate={setCurrentUser}
                  onLogout={handleLogout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showConfirm={showConfirm}
                />
              )}
              {currentUser.user_type === 'admin' && (
                <AdminDashboard
                  currentUser={currentUser}
                  onProfileUpdate={setCurrentUser}
                  onLogout={handleLogout}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  showConfirm={showConfirm}
                />
              )}
            </>
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
