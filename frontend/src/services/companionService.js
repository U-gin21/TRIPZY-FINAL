import { apiRequest } from '../api';

export const companionService = {
  listPosts: async (filters = {}) => {
    const res = await apiRequest('companions', 'list_posts', 'GET', {
      destination: filters.destination || '',
      gender_preference: filters.gender_preference || ''
    });
    return res.posts || [];
  },

  getIncomingRequests: async () => {
    const res = await apiRequest('companions', 'incoming_requests', 'GET');
    return res.requests || [];
  },

  getMyRequests: async () => {
    const res = await apiRequest('companions', 'my_requests', 'GET');
    return res.requests || [];
  },

  getMyPosts: async () => {
    const res = await apiRequest('companions', 'my_posts', 'GET');
    return res.posts || [];
  },

  createPost: async (postData) => {
    return await apiRequest('companions', 'create_post', 'POST', postData);
  },

  sendRequest: async (postId, message) => {
    return await apiRequest('companions', 'send_request', 'POST', {
      post_id: postId,
      message
    });
  },

  updateRequest: async (requestId, status) => {
    return await apiRequest('companions', 'update_request', 'POST', {
      request_id: requestId,
      status
    });
  }
};
