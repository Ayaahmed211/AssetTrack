import api from './api';

const authService = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Backend returns { accessToken, tokenType }
      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        // Store user info (email for now, since backend doesn't return user object)
        const user = { email };
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          token: response.data.accessToken,
          user: user
        };
      }
      
      return response.data;
    } catch (error) {
      // Handle different error response formats
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Backend returned an error response
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw { message: errorMessage };
    }
  },

  // Signup user
  signup: async (userData) => {
    try {
      // Backend expects { name, email, password }
      const signupData = {
        name: userData.username,
        email: userData.email,
        password: userData.password
      };
      
      const response = await api.post('/auth/signup', signupData);
      
      // Backend returns success message, not token
      // So we need to login after successful signup
      if (response.status === 200) {
        // Auto-login after signup
        return await authService.login(userData.email, userData.password);
      }
      
      return response.data;
    } catch (error) {
      // Handle different error response formats
      let errorMessage = 'Signup failed. Please try again.';
      
      if (error.response) {
        // Backend returned an error response
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Email already exists or invalid data';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw { message: errorMessage };
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

export default authService;
