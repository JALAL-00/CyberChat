import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getUsersForChat, findOrCreateConversation, getMessagesHistory } from '../../api/apiService';
import { createAction } from '@reduxjs/toolkit';

export const handleNewMessage = createAction('chat/handleNewMessage');

const initialState = {
    users: [],
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    error: null,
    typingUsers: {},
};

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

export const loadConversation = createAsyncThunk(
    'chat/loadConversation',
    async (recipientId, thunkAPI) => {
        try {
            const conversation = await findOrCreateConversation(recipientId);
            const conversationId = conversation._id;
            const messages = await getMessagesHistory(conversationId);
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
            .addCase(handleNewMessage, (state, action) => {
                const message = action.payload;
                if (state.activeConversation?._id === message.conversation) {
                    state.messages.push(message);
                }
                const convoIndex = state.conversations.findIndex(c => c._id === message.conversation);
                if (convoIndex !== -1) {
                    state.conversations[convoIndex].lastMessage = message;
                }
            });
    },
});

export const { setActiveConversation, startTyping, stopTyping } = chatSlice.actions;

export default chatSlice.reducer;
