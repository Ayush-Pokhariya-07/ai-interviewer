import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useAuthStore = create((set) => ({
  authUser: null,
  isLoggingIn: false,
  isSigningUp: false,

  signup: async (formData) => {
    set({ isSigningUp: true });
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, formData, {
        withCredentials: true,
      });

      if (res.data) {
        set({ authUser: res.data, isSigningUp: false });
        toast.success('Account created successfully!');
        window.location.href = '/recruiter';
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.message || 'Signup failed');
      set({ isSigningUp: false });
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true });
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData, {
        withCredentials: true,
      });

      if (res.data) {
        set({ authUser: res.data, isLoggingIn: false });
        toast.success('Logged in successfully!');
        window.location.href = '/recruiter';
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/auth/logout`, {}, {
        withCredentials: true,
      });
      set({ authUser: null });
      toast.success('Logged out successfully!');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  },

  checkAuthUser: async () => {
    try {
      const res = await axios.get(`${API_URL}/auth/check`, {
        withCredentials: true,
      });
      set({ authUser: res.data });
      return res.data;
    } catch (error) {
      set({ authUser: null });
      return null;
    }
  },
}));

export { useAuthStore };
export default useAuthStore;

