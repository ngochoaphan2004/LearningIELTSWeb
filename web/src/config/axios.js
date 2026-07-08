import axios from 'axios';
import { auth } from './firebase';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000', // Update this if backend runs on different port/host
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    // If a user is logged in, grab their latest token and attach it
    if (auth.currentUser) {
      try {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Error fetching Firebase token", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const errorMessage = error.response.data?.error || '';
      
      if (errorMessage.includes('User not found in database') || errorMessage.includes('Invalid or expired Firebase token')) {
        console.warn('Authentication error or user not found. Logging out and redirecting to login...');
        try {
          await auth.signOut();
        } catch (e) {
          console.error('Error signing out', e);
        }
        window.location.href = '/'; // Redirect to Home / Auth page
      }
    }
    return Promise.reject(error);
  }
);
export default apiClient;
