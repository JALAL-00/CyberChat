const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const mongoose = require('mongoose');

const onlineUsers = {};

const socketAuthMiddleware = async (socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
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

const chatSocketLogic = (io) => {
    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        const socketId = socket.id;

        onlineUsers[userId] = socketId;
        io.emit('user-online', userId);
        console.log(`User connected: ${socket.user.firstName}. SocketID: ${socketId}`);

        socket.on('join-conversation', (conversationId) => {
            socket.join(conversationId);
            console.log(`${socket.user.firstName} joined room: ${conversationId}`);
        });

        socket.on('message-sent', async ({ conversationId, content, type = 'text', mediaUrl = null }) => {
            try {
                const conversation = await Conversation.findById(conversationId);
                if (!conversation) return;

                const newMessage = await Message.create({
                    conversation: conversationId,
                    sender: socket.user._id,
                    content,
                    type,
                    mediaUrl,
                });

                await Conversation.updateOne(
                    { _id: conversationId },
                    { lastMessage: newMessage._id, updatedAt: Date.now() }
                );

                const messagePayload = await newMessage.populate('sender', 'firstName lastName profilePicture email');

                io.to(conversationId).emit('message-received', messagePayload);
            } catch (error) {
                console.error('Error saving or broadcasting message:', error);
            }
        });

        socket.on('typing-start', ({ conversationId }) => {
            socket.to(conversationId).emit('typing-started', { userId: userId, conversationId: conversationId });
        });

        socket.on('typing-stop', ({ conversationId }) => {
            socket.to(conversationId).emit('typing-stopped', { userId: userId, conversationId: conversationId });
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.firstName}`);
            delete onlineUsers[userId];
            io.emit('user-offline', userId);
        });
    });
};

module.exports = {
    socketAuthMiddleware,
    onlineUsers,
    chatSocketLogic
};
