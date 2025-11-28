// backend/src/controllers/chatController.js

const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const mongoose = require('mongoose');

const formatUser = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePicture: user.profilePicture,
});

// @desc    Get a list of all other users for a contact list
// @route   GET /api/chat/users
// @access  Protected
const getUsersForChat = async (req, res) => {
    try {
        // Find all users except the current user
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users.map(formatUser));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Find or create a private conversation
// @route   POST /api/chat/conversations
// @access  Protected
const findOrCreateConversation = async (req, res) => {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Convert IDs to Mongoose ObjectIds for the query
    const participantIds = [currentUserId, new mongoose.Types.ObjectId(recipientId)];

    try {
        let conversation = await Conversation.findOne({
            participants: { $all: participantIds, $size: 2 },
        })
        .populate('participants', 'firstName lastName profilePicture email') // Populate user details
        .populate({
            path: 'lastMessage',
            select: 'content sender createdAt type mediaUrl',
            populate: {
                path: 'sender',
                select: 'firstName lastName',
            }
        });

        // If conversation doesn't exist, create it
        if (!conversation) {
            conversation = await Conversation.create({ participants: participantIds });

            // Re-fetch to populate the newly created object
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'firstName lastName profilePicture email');
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error finding/creating conversation:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Fetch messages for a conversation
// @route   GET /api/chat/conversations/:id/messages
// @access  Protected
const getMessages = async (req, res) => {
    const conversationId = req.params.id;

    try {
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'firstName lastName profilePicture email')
            .sort({ createdAt: 1 }); // Sort by creation date ascending

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsersForChat,
    findOrCreateConversation,
    getMessages,
};