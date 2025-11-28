import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BACKEND_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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

export default api;
