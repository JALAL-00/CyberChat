// frontend/src/redux/slices/chatSlice.js (UPDATED with Thunks)

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUsersForChat, findOrCreateConversation, getMessagesHistory } from '../../api/apiService';
import { createAction } from '@reduxjs/toolkit';

// Define a non-Thunk action for socket event handling
export const handleNewMessage = createAction('chat/handleNewMessage');

const initialState = {
    users: [], // List of all users for contact list
    conversations: [], // Conversation list saved in Redux (optional, but good for MERN structure)
    activeConversation: null, // The currently viewed conversation object
    messages: [], // Messages for the active conversation
    isLoading: false,
    error: null,
    typingUsers: {}, // { conversationId: [userId1, userId2] }
};

// --- ASYNC THUNKS ---

// Thunk to fetch all users (contacts)
export const fetchUsers = createAsyncThunk(
    'chat/fetchUsers',
    async (_, thunkAPI) => {
        try {
            return await getUsersForChat();
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch users');
        }
    }
);

// Thunk to load or create a conversation and fetch messages
export const loadConversation = createAsyncThunk(
    'chat/loadConversation',
    async (recipientId, thunkAPI) => {
        try {
            // 1. Find or create the conversation
            const conversation = await findOrCreateConversation(recipientId);
            const conversationId = conversation._id;

            // 2. Fetch messages for that conversation
            const messages = await getMessagesHistory(conversationId);

            // 3. Get the socket instance and join the room
            const socket = thunkAPI.getState().socket.socket;
            if (socket) {
                socket.emit('join-conversation', conversationId);
            }

            return { conversation, messages };
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to load conversation');
        }
    }
);

export const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setActiveConversation: (state, action) => {
            state.activeConversation = action.payload;
        },
        // --- TYPING INDICATOR REDUCERS ---
        startTyping: (state, action) => {
            const { conversationId, userId } = action.payload;
            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = [];
            }
            if (!state.typingUsers[conversationId].includes(userId)) {
                state.typingUsers[conversationId].push(userId);
            }
        },
        stopTyping: (state, action) => {
            const { conversationId, userId } = action.payload;
            if (state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = state.typingUsers[conversationId].filter(id => id !== userId);
                if (state.typingUsers[conversationId].length === 0) {
                    delete state.typingUsers[conversationId];
                }
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Handlers for fetchUsers ---
            .addCase(fetchUsers.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.isLoading = false;
                state.users = action.payload;
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // --- Handlers for loadConversation ---
            .addCase(loadConversation.pending, (state) => {
                state.isLoading = true;
                state.activeConversation = null;
                state.messages = [];
            })
            .addCase(loadConversation.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeConversation = action.payload.conversation;
                state.messages = action.payload.messages;
            })
            .addCase(loadConversation.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // --- Handler for Real-time Message ---
            .addCase(handleNewMessage, (state, action) => {
                const message = action.payload;
                // Only add message if the conversation ID matches the currently active one
                if (state.activeConversation?._id === message.conversation) {
                    state.messages.push(message);
                }
                // Optional: Update the lastMessage property in the conversations array
                const convoIndex = state.conversations.findIndex(c => c._id === message.conversation);
                if (convoIndex !== -1) {
                    state.conversations[convoIndex].lastMessage = message;
                }
            });
    },
});

export const { setActiveConversation, startTyping, stopTyping } = chatSlice.actions;

export default chatSlice.reducer;