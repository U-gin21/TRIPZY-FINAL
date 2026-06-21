import { apiRequest } from '../api';

export const authService = {
  login: async (email, password) => {
    return await apiRequest('auth', 'login', 'POST', { email, password });
  },

  register: async (formData) => {
    return await apiRequest('auth', 'register', 'POST', formData);
  },

  forgotPassword: async (email) => {
    return await apiRequest('auth', 'forgot_password', 'POST', { email });
  },

  verifyResetToken: async (token) => {
    return await apiRequest('auth', 'verify_reset_token', 'POST', { token });
  },

  resetPassword: async (password) => {
    return await apiRequest('auth', 'reset_password', 'POST', { password });
  },

  getCurrentUser: async () => {
    const res = await apiRequest('auth', 'me');
    return res.success ? res.user : null;
  },

  logout: async () => {
    return await apiRequest('auth', 'logout', 'POST');
  }
};
