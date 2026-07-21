import React, { useEffect, useState, useRef } from 'react';
import { getUploadUrl, getProfilePhoto } from '../../../api';
import { touristApi } from './touristApi';
import { companionService } from '../../../services/companionService';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

// Components
import Sidebar from './components/Sidebar';
import BookingsTab from './components/BookingsTab';
import BookServicesTab from './components/BookServicesTab';
import CompanionTab from './components/CompanionTab';
import NotificationsTab from '../../../components/common/NotificationsTab';
import ProfileTab from './components/ProfileTab';
import BookServiceModal from './components/BookServiceModal';
import ReviewModal from './components/ReviewModal';
import CreateCompanionPostModal from './components/CreateCompanionPostModal';
import RequestJoinModal from './components/RequestJoinModal';

export default function TouristDashboard({ 
  currentUser, 
  onProfileUpdate, 
  initialServiceType, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  showConfirm 
}) {

  // Data states
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [companionPosts, setCompanionPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Rating states
  const [ratingPostId, setRatingPostId] = useState(null);
  const [rateableParticipants, setRateableParticipants] = useState([]);
  const [loadingRateable, setLoadingRateable] = useState(false);
  const [rateError, setRateError] = useState('');
  const [tempRatings, setTempRatings] = useState({});
  
  // Booking Form State
  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingDetails, setBookingDetails] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingRooms, setBookingRooms] = useState(1);
  const [serviceBookings, setServiceBookings] = useState([]);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);
  const startDateInstance = useRef(null);
  const endDateInstance = useRef(null);

  // Review Form State
  const [reviewServiceId, setReviewServiceId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Companion Post Form State
  const [postDest, setPostDest] = useState('');
  const [postStartDate, setPostStartDate] = useState('');
  const [postEndDate, setPostEndDate] = useState('');
  const [postBudget, setPostBudget] = useState('');
  const [postCompanionsNeeded, setPostCompanionsNeeded] = useState(1);
  const [postGenderPref, setPostGenderPref] = useState('Any');
  const [postInterests, setPostInterests] = useState('');
  const [postDesc, setPostDesc] = useState('');
  const [postSubmitting, setPostSubmitting] = useState(false);
  
  // Companion Request State
  const [requestPost, setRequestPost] = useState(null);
  const [requestMsg, setRequestMsg] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Search service filter
  const [serviceTypeFilter, setServiceTypeFilter] = useState(initialServiceType || 'hotel');

  useEffect(() => {
    if (initialServiceType) {
      setServiceTypeFilter(initialServiceType);
    }
  }, [initialServiceType]);

  // Load details
  useEffect(() => {
    fetchBookings();
    fetchServices();
    fetchCompanionDetails();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedService) {
      fetchServiceBookings(selectedService.id);
    } else {
      setServiceBookings([]);
    }
  }, [selectedService]);

  const fetchServiceBookings = async (serviceId) => {
    try {
      const bookings = await touristApi.fetchServiceBookings(serviceId);
      setServiceBookings(bookings);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Destroy previous instances if they exist
    if (startDateInstance.current) {
      startDateInstance.current.destroy();
      startDateInstance.current = null;
    }
    if (endDateInstance.current) {
      endDateInstance.current.destroy();
      endDateInstance.current = null;
    }

    if (!selectedService || !startDateRef.current || !endDateRef.current) return;

    let disableRanges = [];
    if (selectedService.service_type === 'hotel') {
      const totalRooms = parseInt(selectedService.no_of_rooms) || 10;
      disableRanges = [
        function(date) {
          const dStr = formatLocalDate(date);
            
          let bookedRooms = 0;
          serviceBookings.forEach(b => {
            if (dStr >= b.start_date && dStr <= b.end_date) {
              bookedRooms += parseInt(b.no_of_rooms) || 0;
            }
          });
          
          return bookedRooms + bookingRooms > totalRooms;
        }
      ];
    } else {
      disableRanges = serviceBookings.map(b => ({
        from: b.start_date,
        to: b.end_date
      }));
    }

    // Initialize Start Date Picker
    startDateInstance.current = flatpickr(startDateRef.current, {
      dateFormat: "Y-m-d",
      minDate: "today",
      disable: disableRanges,
      onChange: (selectedDates, dateStr) => {
        setStartDate(dateStr);
        // Clear end date if it is before start date or overlaps
        if (endDate) {
          const sVal = parseLocalDate(dateStr);
          const eVal = parseLocalDate(endDate);
          sVal.setHours(0,0,0,0);
          eVal.setHours(0,0,0,0);
          if (sVal > eVal) {
            setEndDate('');
            if (endDateInstance.current) {
              endDateInstance.current.clear();
            }
          } else {
            // Check overlap
            const overlap = isDateOverlapping(dateStr, endDate, selectedService.service_type === 'hotel' ? bookingRooms : 1);
            if (overlap) {
              setEndDate('');
              if (endDateInstance.current) {
                endDateInstance.current.clear();
              }
            }
          }
        }
      }
    });

    // Initialize End Date Picker
    endDateInstance.current = flatpickr(endDateRef.current, {
      dateFormat: "Y-m-d",
      minDate: startDate || "today",
      disable: disableRanges,
      onChange: (selectedDates, dateStr) => {
        setEndDate(dateStr);
      }
    });

    // Clean up instances when unmounting or dependencies change
    return () => {
      if (startDateInstance.current) {
        startDateInstance.current.destroy();
        startDateInstance.current = null;
      }
      if (endDateInstance.current) {
        endDateInstance.current.destroy();
        endDateInstance.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, serviceBookings, bookingRooms]);

  // Adjust minDate of End Date Picker when startDate changes
  useEffect(() => {
    if (endDateInstance.current) {
      endDateInstance.current.set("minDate", startDate || "today");
    }
  }, [startDate]);

  const fetchBookings = async () => {
    try {
      const bookings = await touristApi.fetchBookings();
      setBookings(bookings);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      const services = await touristApi.fetchServices(serviceTypeFilter);
      setServices(services);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-fetch services when filter changes
  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceTypeFilter]);

  const fetchCompanionDetails = async () => {
    try {
      const data = await touristApi.fetchCompanionDetails();
      setCompanionPosts(data.companionPosts);
      setMyPosts(data.myPosts);
      setMyRequests(data.myRequests);
      setIncomingRequests(data.incomingRequests);
    } catch (err) {
      console.error(err);
    }
  };

  // Helper to safely hide modals
  const safeHideModal = (modalId) => {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && window.bootstrap && window.bootstrap.Modal) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      }
    } catch (err) {
      console.error(`Error hiding modal ${modalId}:`, err);
    }
    // Force backdrop cleanup to prevent black screen overlay
    setTimeout(() => {
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(el => el.remove());
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }, 100);
  };

  const handleSendCompanionRequest = async (e) => {
    e.preventDefault();
    if (!requestPost) {
      return;
    }
    setRequestSubmitting(true);
    try {
      await touristApi.sendCompanionRequest(requestPost.id, requestMsg);
      alert('Join request sent successfully! The host will be notified.');
      setRequestMsg('');
      setRequestPost(null);
      fetchCompanionDetails();
      safeHideModal('requestJoinModal');
    } catch (err) {
      alert(err.message);
    } finally {
      setRequestSubmitting(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const notifications = await touristApi.fetchNotifications();
      setNotifications(notifications);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const parseLocalDate = (dateStr) => {
    const parts = dateStr.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  };

  const formatLocalDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const isDateOverlapping = (start, end, requestedRooms = 1) => {
    if (!start || !end) return false;
    if (selectedService && selectedService.service_type === 'hotel') {
      const totalRooms = parseInt(selectedService.no_of_rooms) || 10;
      const startD = parseLocalDate(start);
      const endD = parseLocalDate(end);
      
      for (let d = new Date(startD); d <= endD; d.setDate(d.getDate() + 1)) {
        const dStr = formatLocalDate(d);
          
        let bookedRooms = 0;
        serviceBookings.forEach(b => {
          if (dStr >= b.start_date && dStr <= b.end_date) {
            bookedRooms += parseInt(b.no_of_rooms) || 0;
          }
        });
        
        if (bookedRooms + requestedRooms > totalRooms) {
          return true;
        }
      }
      return false;
    } else {
      const sNew = parseLocalDate(start);
      const eNew = parseLocalDate(end);
      sNew.setHours(0,0,0,0);
      eNew.setHours(0,0,0,0);

      return serviceBookings.some(b => {
        const sOld = parseLocalDate(b.start_date);
        const eOld = parseLocalDate(b.end_date);
        sOld.setHours(0,0,0,0);
        eOld.setHours(0,0,0,0);
        return sNew <= eOld && eNew >= sOld;
      });
    }
  };

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (bookingSubmitting) return;

    if (parseLocalDate(startDate) > parseLocalDate(endDate)) {
      alert("Start date cannot be after end date.");
      return;
    }

    const roomsToBook = selectedService.service_type === 'hotel' ? bookingRooms : 1;

    if (isDateOverlapping(startDate, endDate, roomsToBook)) {
      alert("Selected dates or rooms are unavailable. Please choose a different option.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await touristApi.createBooking(
        selectedService.id,
        selectedService.service_type,
        startDate,
        endDate,
        bookingDetails,
        roomsToBook
      );
      alert(res.message);
      setStartDate('');
      setEndDate('');
      setBookingDetails('');
      setBookingRooms(1);
      safeHideModal('bookServiceModal');
      setSelectedService(null);
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setBookingSubmitting(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await touristApi.addReview(reviewServiceId, rating, comment);
      alert("Review submitted successfully! Thank you for your feedback.");
      setComment('');
      setRating(5);
      safeHideModal('addReviewModal');
      setReviewServiceId(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateCompanionPost = async (e) => {
    e.preventDefault();

    const numericRegex = /^\d+$/;
    if (numericRegex.test(postDest.trim())) {
      alert('Destination place cannot consist only of numbers.');
      return;
    }

    setPostSubmitting(true);
    try {
      await touristApi.createCompanionPost({
        destination_place: postDest,
        start_date: postStartDate,
        end_date: postEndDate,
        budget_range: postBudget,
        companions_needed: postCompanionsNeeded,
        gender_preference: postGenderPref,
        travel_interests: postInterests,
        description: postDesc
      });
      alert('Companion post created successfully.');
      setPostDest('');
      setPostStartDate('');
      setPostEndDate('');
      setPostBudget('');
      setPostCompanionsNeeded(1);
      setPostGenderPref('Any');
      setPostInterests('');
      setPostDesc('');
      fetchCompanionDetails();
      safeHideModal('createCompanionPostModal');
    } catch (err) {
      alert(err.message);
    } finally {
      setPostSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      await touristApi.updateCompanionRequest(requestId, 'accepted');
      alert("Request accepted! Contact details have been shared via email.");
      fetchCompanionDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await touristApi.updateCompanionRequest(requestId, 'rejected');
      alert("Request rejected.");
      fetchCompanionDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePost = (postId) => {
    showConfirm(
      "Are you sure you want to delete this companion post? This action cannot be undone.",
      async () => {
        try {
          await touristApi.deleteCompanionPost(postId);
          alert("Companion post deleted successfully.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Delete Companion Post"
    );
  };

  const handleClosePost = (postId) => {
    showConfirm(
      "Close this companion search? You will no longer accept new requests.",
      async () => {
        try {
          await touristApi.closeCompanionPost(postId);
          alert("Companion post closed. No more join requests accepted.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Close Companion Search"
    );
  };

  const handleCancelRequest = (requestId) => {
    showConfirm(
      "Cancel this join request? You can send another request later.",
      async () => {
        try {
          await touristApi.cancelCompanionRequest(requestId);
          alert("Join request cancelled.");
          fetchCompanionDetails();
        } catch (err) {
          alert(err.message);
        }
      },
      "Cancel Join Request"
    );
  };

  const handleOpenRateModal = async (postId) => {
    setRatingPostId(postId);
    setRateableParticipants([]);
    setRateError('');
    setLoadingRateable(true);
    setTempRatings({});
    try {
      const participants = await companionService.getRateableParticipants(postId);
      setRateableParticipants(participants);
      const initialRatings = {};
      participants.forEach(p => {
        if (!p.has_rated) {
          initialRatings[p.user_id] = 10;
        }
      });
      setTempRatings(initialRatings);
    } catch (err) {
      setRateError(err.message || 'Failed to load companions for rating.');
    } finally {
      setLoadingRateable(false);
    }
  };

  const handleSubmitCompanionRating = async (rateeId) => {
    const ratingValue = tempRatings[rateeId] || 10;
    try {
      await companionService.submitRating(ratingPostId, rateeId, ratingValue);
      alert('Companion rated successfully!');
      handleOpenRateModal(ratingPostId);
      fetchCompanionDetails();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Mobile Top Header */}
      <div className="mobile-header-dashboard d-flex align-items-center justify-content-between p-3 d-lg-none text-white w-100">
        <button className="btn btn-outline-light border-0 p-0" onClick={() => setIsSidebarOpen(true)}>
          <i className="bi bi-list fs-2"></i>
        </button>
        <span className="fw-bold fs-5"><i className="bi bi-person-circle text-primary me-2"></i>Tourist Panel</span>
        <div style={{ width: '28px' }}></div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay d-lg-none" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <Sidebar 
        currentUser={currentUser} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={onLogout} 
        unreadNotificationsCount={notifications.filter(n => !n.is_read || n.is_read == '0').length}
        pendingCompanionsCount={incomingRequests.filter(r => r.status === 'pending').length}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* DASHBOARD CONTENT */}
      <div className="dashboard-content animate-fade-in">
        {activeTab === 'bookings' && (
          <BookingsTab 
            bookings={bookings} 
            setReviewServiceId={setReviewServiceId} 
          />
        )}

        {activeTab === 'services' && (
          <BookServicesTab 
            services={services} 
            serviceTypeFilter={serviceTypeFilter} 
            setServiceTypeFilter={setServiceTypeFilter} 
            setSelectedService={setSelectedService} 
          />
        )}

        {activeTab === 'companion' && (
          <CompanionTab 
            currentUser={currentUser} 
            companionPosts={companionPosts} 
            myPosts={myPosts} 
            myRequests={myRequests} 
            incomingRequests={incomingRequests} 
            fetchCompanionDetails={fetchCompanionDetails} 
            handleClosePost={handleClosePost} 
            handleDeletePost={handleDeletePost} 
            handleApproveRequest={handleApproveRequest} 
            handleRejectRequest={handleRejectRequest} 
            handleCancelRequest={handleCancelRequest} 
            setRequestPost={setRequestPost} 
            setRequestMsg={setRequestMsg} 
            handleOpenRateModal={handleOpenRateModal}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsTab 
            notifications={notifications} 
            onRefresh={fetchNotifications}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab 
            currentUser={currentUser} 
            onProfileUpdate={onProfileUpdate} 
            bookings={bookings} 
            myPosts={myPosts} 
            myRequests={myRequests} 
          />
        )}
      </div>

      {/* MODALS */}
      <BookServiceModal 
        selectedService={selectedService} 
        startDate={startDate} 
        endDate={endDate} 
        bookingDetails={bookingDetails} 
        setBookingDetails={setBookingDetails} 
        bookingSubmitting={bookingSubmitting} 
        handleCreateBooking={handleCreateBooking} 
        startDateRef={startDateRef} 
        endDateRef={endDateRef} 
        bookingRooms={bookingRooms}
        setBookingRooms={setBookingRooms}
      />

      <ReviewModal 
        rating={rating} 
        setRating={setRating} 
        comment={comment} 
        setComment={setComment} 
        handleReviewSubmit={handleReviewSubmit} 
      />

      <CreateCompanionPostModal 
        postDest={postDest} 
        setPostDest={setPostDest} 
        postStartDate={postStartDate} 
        setPostStartDate={setPostStartDate} 
        postEndDate={postEndDate} 
        setPostEndDate={setPostEndDate} 
        postBudget={postBudget} 
        setPostBudget={setPostBudget} 
        postCompanionsNeeded={postCompanionsNeeded} 
        setPostCompanionsNeeded={setPostCompanionsNeeded} 
        postGenderPref={postGenderPref} 
        setPostGenderPref={setPostGenderPref} 
        postInterests={postInterests} 
        setPostInterests={setPostInterests} 
        postDesc={postDesc} 
        setPostDesc={setPostDesc} 
        postSubmitting={postSubmitting} 
        handleCreateCompanionPost={handleCreateCompanionPost} 
      />

      <RequestJoinModal 
        requestPost={requestPost} 
        requestMsg={requestMsg} 
        setRequestMsg={setRequestMsg} 
        requestSubmitting={requestSubmitting} 
        handleSendCompanionRequest={handleSendCompanionRequest} 
      />

      <div className="modal fade" id="dashboardRateCompanionsModal" tabIndex="-1" aria-hidden="true" style={{ zIndex: 1060 }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-4 border-0 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <h4 className="modal-title fw-bold text-gradient text-emerald">Rate Travel Companions</h4>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body p-4 text-dark text-start">
              {loadingRateable ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-emerald" role="status"></div>
                  <p className="small text-muted mt-2">Loading companions...</p>
                </div>
              ) : rateError ? (
                <div className="alert alert-danger text-center small mb-0" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i> {rateError}
                </div>
              ) : rateableParticipants.length > 0 ? (
                <div>
                  <p className="small text-muted mb-3">Rate your travel buddies on a scale of 1 to 10 based on your trip experience:</p>
                  <div className="d-flex flex-column gap-3">
                    {rateableParticipants.map((p) => {
                      const avatarUrl = getProfilePhoto(p.profile_photo);
                      return (
                        <div key={p.user_id} className="d-flex align-items-center justify-content-between p-3 border rounded-3 bg-light">
                          <div className="d-flex align-items-center gap-3">
                            <img 
                              src={avatarUrl} 
                              alt={p.full_name} 
                              className="rounded-circle border border-emerald" 
                              style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            />
                            <div>
                              <h6 className="fw-bold mb-0 text-dark small">{p.full_name}</h6>
                              <span className="badge bg-secondary rounded-pill small" style={{ fontSize: '10px' }}>
                                {p.role === 'host' ? 'Trip Host' : 'Participant'}
                              </span>
                            </div>
                          </div>
                          
                          <div>
                            {p.has_rated ? (
                              <span className="badge bg-success rounded-pill px-3 py-2 small">
                                <i className="bi bi-check-circle-fill me-1"></i> Rated
                              </span>
                            ) : (
                              <div className="d-flex gap-2 align-items-center">
                                <select 
                                  className="form-select form-select-sm rounded-3" 
                                  value={tempRatings[p.user_id] || 10}
                                  onChange={(e) => setTempRatings({
                                    ...tempRatings,
                                    [p.user_id]: parseInt(e.target.value)
                                  })}
                                  style={{ width: '70px' }}
                                >
                                  {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(v => (
                                    <option key={v} value={v}>{v}</option>
                                  ))}
                                </select>
                                <button 
                                  className="btn btn-sm btn-gradient rounded-pill px-3"
                                  onClick={() => handleSubmitCompanionRating(p.user_id)}
                                >
                                  Submit
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  No rateable companions found.
                </div>
              )}
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
