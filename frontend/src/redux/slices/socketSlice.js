import { createSlice } from '@reduxjs/toolkit';
import { io } from 'socket.io-client';
import Cookies from 'js-cookie';
import { handleNewMessage, chatSlice } from './chatSlice';

const initialState = {
    socket: null,
    isConnected: false,
    onlineUsers: {}, 
};

export const socketSlice = createSlice({
    name: 'socket',
    initialState,
    reducers: {
        setSocket: (state, action) => {
            state.socket = action.payload;
            state.isConnected = !!action.payload;
        },
        userOnline: (state, action) => {
            state.onlineUsers[action.payload] = true;
        },
        userOffline: (state, action) => {
            delete state.onlineUsers[action.payload];
        },
        clearSocketState: (state) => {
            state.socket?.disconnect();
            state.socket = null;
            state.isConnected = false;
            state.onlineUsers = {};
        }
    },
});

export const { setSocket, userOnline, userOffline, clearSocketState } = socketSlice.actions;

export const connectSocket = () => (dispatch, getState) => {
    const { auth } = getState();
    const token = Cookies.get('token'); 

    if (auth.user && token && !getState().socket.socket) {
        const newSocket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001', {
            auth: {
                token: token
            },
            transports: ['websocket', 'polling'] 
        });

        newSocket.on('connect', () => {
            dispatch(setSocket(newSocket));
            console.log('Socket.IO Connected!');
        });

        newSocket.on('disconnect', () => {
            dispatch(setSocket(null));
            console.log('Socket.IO Disconnected');
        });

        newSocket.on('message-received', (message) => {
            dispatch(handleNewMessage(message));
        });

        newSocket.on('user-online', (userId) => {
            dispatch(userOnline(userId));
        });

        newSocket.on('user-offline', (userId) => {
            dispatch(userOffline(userId));
        });

        newSocket.on('typing-started', ({ userId, conversationId }) => {
            dispatch(chatSlice.actions.startTyping({ userId, conversationId }));
        });

        newSocket.on('typing-stopped', ({ userId, conversationId }) => {
            dispatch(chatSlice.actions.stopTyping({ userId, conversationId }));
        });

    } else if (!auth.user && getState().socket.socket) {
        dispatch(clearSocketState());
    }
};

export default socketSlice.reducer;
