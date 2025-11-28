// frontend/src/redux/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import socketReducer from './slices/socketSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        socket: socketReducer,
    },
    // Required to store non-serializable data (like the Socket.IO instance)
    middleware: (getDefaultMiddleware) => 
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['socket/setSocket', 'socket/connectSocket'],
                ignoredPaths: ['socket.socket'],
            }
        }),
});