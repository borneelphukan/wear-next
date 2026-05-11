import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const getBaseURL = () => {
  // Extract host IP from Expo Constants (e.g. "192.168.0.164:8081")
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:4000`;
  }
  return 'http://localhost:4000';
};

const axiosInstance = axios.create({
  baseURL: getBaseURL(), // Dynamically resolved backend URL
  timeout: 10000, // Optional timeout
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // You can add headers here, e.g., Authorization token
    const session = await AsyncStorage.getItem('userSession');
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        if (parsedSession?.token) {
          config.headers.Authorization = `Bearer ${parsedSession.token}`;
        }
        if (parsedSession?.email) {
          config.headers['x-user-email'] = parsedSession.email;
        }
      } catch (e) {
        console.error('Error parsing session token in axios interceptor', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors, maybe redirect to login or clear session
      console.warn('Unauthorized request handled by axios interceptor');
    }
    if (error.response && error.response.status === 429) {
      console.warn('Rate limit exceeded');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
