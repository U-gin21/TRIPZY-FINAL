import { apiRequest } from '../../../api';

export const providerApi = {
  fetchListings: async () => {
    const res = await apiRequest('services', 'provider_list');
    return res.services || [];
  },
  fetchBookings: async () => {
    const res = await apiRequest('bookings', 'provider_list');
    return res.bookings || [];
  },
  fetchNotifications: async () => {
    const res = await apiRequest('notifications', 'list');
    return res.notifications || [];
  }
};
