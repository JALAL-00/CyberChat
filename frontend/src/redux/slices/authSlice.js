// frontend/src/redux/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// Utility function to get user from cookie/token
const getUserFromCookie = () => {
    const token = Cookies.get('token');
    if (token) {
        try {
            // Simple JWT payload decoding (base64)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return { token, _id: payload.id, email: payload.email }; // Get necessary info
        } catch (e) {
            console.error("Failed to decode token:", e);
            Cookies.remove('token');
            return null;
        }
    }
    return null;
};

const initialState = {
    user: getUserFromCookie(), // Load user on startup
    isLoading: false,
    error: null,
};

// Async Thunks for API interaction
export const register = createAsyncThunk(
    'auth/register',
    async (userData, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/register`, userData);
            Cookies.set('token', response.data.token, { expires: 10 }); // Expires in 10 days
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const login = createAsyncThunk(
    'auth/login',
    async (userData, thunkAPI) => {
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, userData);
            Cookies.set('token', response.data.token, { expires: 10 });
            return response.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            Cookies.remove('token');
        },
    },
    extraReducers: (builder) => {
        builder
            // Register & Login common logic
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addMatcher((action) => action.type.endsWith('/pending'), (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addMatcher((action) => action.type.endsWith('/rejected'), (state, action) => {
                state.isLoading = false;
                state.error = action.payload || 'An error occurred';
                state.user = null;
                Cookies.remove('token');
            });
    },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;