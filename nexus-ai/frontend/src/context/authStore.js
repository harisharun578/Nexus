import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Set auth header on init
const initAuth = (token) => {
  if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,

      init: () => { initAuth(get().token); },

      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/auth/login`, { email, password });
          initAuth(data.token);
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome back, ${data.user.name}!`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Login failed');
          return { success: false };
        }
      },

      signup: async (formData) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/auth/signup`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          initAuth(data.token);
          set({ user: data.user, token: data.token, loading: false });
          toast.success('Account created! Register your biometrics.');
          return { success: true };
        } catch (err) {
          set({ loading: false });
          toast.error(err.response?.data?.message || 'Signup failed');
          return { success: false };
        }
      },

      googleLogin: async (credential) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/auth/google`, { credential });
          initAuth(data.token);
          set({ user: data.user, token: data.token, loading: false });
          toast.success(`Welcome, ${data.user.name}!`);
          return { success: true };
        } catch (err) {
          set({ loading: false });
          toast.error('Google login failed');
          return { success: false };
        }
      },

      faceLogin: async (descriptor) => {
        set({ loading: true });
        try {
          const { data } = await axios.post(`${API}/auth/face-login`, { descriptor });
          if (data.success) {
            initAuth(data.token);
            set({ user: data.user, token: data.token, loading: false });
            toast.success(`Face verified! Welcome, ${data.user.name}`);
            return { success: true, user: data.user };
          }
          set({ loading: false });
          toast.error(`Face not recognized (distance: ${data.distance?.toFixed(3)})`);
          return { success: false };
        } catch (err) {
          set({ loading: false });
          toast.error('Face recognition error');
          return { success: false };
        }
      },

      registerFace: async (descriptors) => {
        try {
          const { data } = await axios.post(`${API}/auth/register-face`, { descriptors });
          set(s => ({ user: { ...s.user, faceRegistered: true } }));
          toast.success(`${descriptors.length} face samples registered!`);
          return { success: true };
        } catch (err) {
          toast.error('Face registration failed');
          return { success: false };
        }
      },

      registerFingerprint: async (credential) => {
        try {
          const { data } = await axios.post(`${API}/auth/register-fingerprint`, { credential });
          set(s => ({ user: { ...s.user, fingerprintRegistered: true } }));
          toast.success('Fingerprint registered!');
          return { success: true };
        } catch (err) {
          toast.error('Fingerprint registration failed');
          return { success: false };
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization'];
        set({ user: null, token: null });
        toast.success('Logged out securely');
      },

      updateUser: (updates) => set(s => ({ user: { ...s.user, ...updates } })),
    }),
    {
      name: 'nexus-auth',
      partialize: s => ({ user: s.user, token: s.token }),
      onRehydrateStorage: () => (state) => { if (state?.token) initAuth(state.token); }
    }
  )
);
