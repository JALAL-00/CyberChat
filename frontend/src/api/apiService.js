// frontend/src/api/apiService.js

import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Create an Axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- CHAT API FUNCTIONS ---

export const getUsersForChat = async () => {
    const response = await api.get('/api/chat/users');
    return response.data;
};

export const findOrCreateConversation = async (recipientId) => {
    const response = await api.post('/api/chat/conversations', { recipientId });
    return response.data;
};

export const getMessagesHistory = async (conversationId) => {
    const response = await api.get(`/api/chat/conversations/${conversationId}/messages`);
    return response.data;
};

// Export the base axios instance for the Redux thunks
export default api;