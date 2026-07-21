import { apiRequest } from '../../../api';

export const adminApi = {
  fetchStats: async () => {
    return await apiRequest('admin', 'stats');
  },
  fetchPendingUsers: async () => {
    const adminRes = await apiRequest('admin', 'pending_admins');
    const provRes = await apiRequest('admin', 'pending_providers');
    return {
      pendingAdmins: adminRes.pending_admins || [],
      pendingProviders: provRes.pending_providers || []
    };
  },
  fetchDestinations: async () => {
    const res = await apiRequest('destinations', 'list');
    return res.destinations || [];
  },
  fetchFaqs: async () => {
    const res = await apiRequest('faqs', 'list');
    return res.faqs || [];
  },
  fetchBookings: async () => {
    const res = await apiRequest('bookings', 'all');
    return res.bookings || [];
  },
  fetchUsers: async () => {
    const res = await apiRequest('admin', 'all_users');
    return res.users || [];
  },
  fetchNotifications: async () => {
    const res = await apiRequest('notifications', 'list');
    return res.notifications || [];
  },
  fetchInquiries: async () => {
    const res = await apiRequest('admin', 'all_inquiries');
    return res.inquiries || [];
  },
  toggleUserStatus: async (id, status) => {
    return await apiRequest('admin', 'approve_user', 'POST', { id, status });
  },
  approveUser: async (id, status) => {
    return await apiRequest('admin', 'approve_user', 'POST', { id, status });
  },
  fetchCompanionPosts: async () => {
    const res = await apiRequest('admin', 'all_companion_posts');
    return res.posts || [];
  },
  deleteCompanionPost: async (postId) => {
    return await apiRequest('admin', 'delete_companion_post', 'POST', { post_id: postId });
  }
};
