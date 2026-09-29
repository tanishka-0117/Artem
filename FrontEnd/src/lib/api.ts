import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Track if this is a session-check call to avoid redirect loops
let isCheckingSession = false;

export function setCheckingSession(value: boolean) {
  isCheckingSession = value;
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login on 401 if we're NOT checking the session
    if (error.response?.status === 401 && !isCheckingSession) {
      // Let the auth store handle this instead of a hard redirect
    }
    return Promise.reject(error);
  },
);

export default api;
