import { apiRequest } from '../api';

export const destinationService = {
  getDestinations: async (filters = {}) => {
    const res = await apiRequest('destinations', 'list', 'GET', {
      query: filters.query || '',
      district: filters.district || '',
      interest_category: filters.interest || '',
      budget_category: filters.budget || ''
    });
    return res.destinations || [];
  },

  createDestination: async (formData) => {
    return await apiRequest('destinations', 'create', 'POST', formData);
  },

  deleteDestination: async (id) => {
    return await apiRequest('destinations', 'delete', 'POST', { id });
  }
};
