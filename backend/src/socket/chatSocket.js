// backend/src/socket/chatSocket.js

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

// Map to store connected users: { userId: socketId }
const onlineUsers = {}; 

// --- 1. SOCKET AUTHENTICATION MIDDLEWARE ---
const socketAuthMiddleware = async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Find the user and attach to the socket
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        socket.user = user;
        next();
    } catch (error) {
        return next(new Error('Authentication error: Invalid token'));
    }
};


// --- 2. CORE SOCKET LOGIC ---
const chatSocketLogic = (io) => {

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        const socketId = socket.id;

        // 1. ONLINE STATUS LOGIC
        // Store the user ID and socket ID
        onlineUsers[userId] = socketId;
        
        // Emit 'user-online' to ALL users to update their contact list
        io.emit('user-online', userId); 
        console.log(`User connected: ${socket.user.firstName}. SocketID: ${socketId}`);


        // 2. JOIN CONVERSATION ROOM
        socket.on('join-conversation', (conversationId) => {
            // Join the specific room for the conversation
            socket.join(conversationId);
            console.log(`${socket.user.firstName} joined room: ${conversationId}`);
        });


        // 3. HANDLE NEW MESSAGE (message-sent)
        socket.on('message-sent', async ({ conversationId, content, type = 'text', mediaUrl = null }) => {
            
            try {
                // Ensure the conversation exists and the user is a participant
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) return;

                // A. Save the message to MongoDB
                const newMessage = await Message.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content,
                    type,
                    mediaUrl,
                });

                // B. Update the Conversation's lastMessage field
                await Conversation.updateOne(
                    { _id: conversationId },
                    { lastMessage: newMessage._id, updatedAt: Date.now() }
                );

                // C. Populate the message for the client payload
                const messagePayload = await newMessage.populate('sender', 'firstName lastName profilePicture email');

                // D. Emit 'message-received' to all members in the conversation room
                // Use the room feature for reliable broadcast to all participants
                io.to(conversationId).emit('message-received', messagePayload);
                
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
            }
        });


        // 4. TYPING INDICATOR
        socket.on('typing-start', ({ conversationId }) => {
            // Broadcast 'typing-start' to everyone in the room EXCEPT the sender
            socket.to(conversationId).emit('typing-started', { userId: userId, conversationId: conversationId });
        });

        socket.on('typing-stop', ({ conversationId }) => {
            // Broadcast 'typing-stop' to everyone in the room EXCEPT the sender
            socket.to(conversationId).emit('typing-stopped', { userId: userId, conversationId: conversationId });
        });


        // 5. DISCONNECT (user-offline)
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.firstName}`);
            
            // Remove user from the online list
            delete onlineUsers[userId]; 

            // Emit 'user-offline' to ALL users
            io.emit('user-offline', userId);
        });
    });
};

module.exports = {
    socketAuthMiddleware,
    onlineUsers,
    chatSocketLogic
};