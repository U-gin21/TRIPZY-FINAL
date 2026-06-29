import { apiRequest } from '../../../api';

export const touristApi = {
  fetchBookings: async () => {
    const res = await apiRequest('bookings', 'tourist_list');
    return res.bookings || [];
  },
  fetchServices: async (typeFilter) => {
    const res = await apiRequest('services', 'list', 'GET', { type: typeFilter });
    return res.services || [];
  },
  fetchCompanionDetails: async () => {
    const sharedPostsRes = await apiRequest('companions', 'list_posts', 'GET');
    const postRes = await apiRequest('companions', 'my_posts');
    const reqRes = await apiRequest('companions', 'my_requests');
    const incomingRes = await apiRequest('companions', 'incoming_requests');
    return {
      companionPosts: sharedPostsRes.posts || [],
      myPosts: postRes.posts || [],
      myRequests: reqRes.requests || [],
      incomingRequests: incomingRes.requests || []
    };
  },
  fetchNotifications: async () => {
    const res = await apiRequest('notifications', 'list');
    return res.notifications || [];
  },
  fetchServiceBookings: async (serviceId) => {
    const res = await apiRequest('bookings', 'service_bookings', 'GET', { service_id: serviceId });
    return res.bookings || [];
  },
  sendCompanionRequest: async (postId, message) => {
    return await apiRequest('companions', 'send_request', 'POST', {
      post_id: postId,
      message
    });
  },
  createBooking: async (serviceId, serviceType, startDate, endDate, bookingDetails) => {
    return await apiRequest('bookings', 'create', 'POST', {
      service_id: serviceId,
      service_type: serviceType,
      start_date: startDate,
      end_date: endDate,
      booking_details: bookingDetails
    });
  },
  addReview: async (serviceId, rating, comment) => {
    return await apiRequest('services', 'add_review', 'POST', {
      service_id: serviceId,
      rating,
      comment
    });
  },
  createCompanionPost: async (postData) => {
    return await apiRequest('companions', 'create_post', 'POST', postData);
  },
  updateCompanionRequest: async (requestId, status) => {
    return await apiRequest('companions', 'update_request', 'POST', {
      request_id: requestId,
      status
    });
  },
  deleteCompanionPost: async (postId) => {
    return await apiRequest('companions', 'delete_post', 'POST', { post_id: postId });
  },
  closeCompanionPost: async (postId) => {
    return await apiRequest('companions', 'close_post', 'POST', { post_id: postId });
  },
  cancelCompanionRequest: async (requestId) => {
    return await apiRequest('companions', 'cancel_request', 'POST', { request_id: requestId });
  }
};
