import axios from "axios";
import { store } from "../src/redux/store";
import { setUser } from "../src/redux/userSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_URL, // Gateway URL
  withCredentials: true, // Crucial: Allows browser to send & receive cookies
});

// Response interceptor to catch expired/invalid sessions globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear Redux state immediately when session dies or cookie is removed
      store.dispatch(setUser(null));
    }
    return Promise.reject(error);
  },
);

export default api;
