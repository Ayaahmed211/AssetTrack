import api from './api';

const userService = {
  // Get all users (Admin/Manager only)
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  // Approve a user's requested role (Admin only)
  approveRole: async (userId) => {
    const response = await api.put(`/users/${userId}/approve-role`);
    return response.data;
  },

  // Update a user's role (Admin only)
  updateUserRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },

  // Toggle user enabled/disabled (Admin only)
  toggleUserStatus: async (userId) => {
    const response = await api.put(`/users/${userId}/toggle-status`);
    return response.data;
  },

  // Delete a user (Admin only)
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Change user password
  changePassword: async (userId, currentPassword, newPassword) => {
    const response = await api.put(`/users/${userId}/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export default userService;
