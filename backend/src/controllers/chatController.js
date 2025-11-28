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

const getUsersForChat = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } }).select('-password');
        res.json(users.map(formatUser));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const findOrCreateConversation = async (req, res) => {
    const { recipientId } = req.body;
    const currentUserId = req.user._id;

    if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
    }

    const participantIds = [currentUserId, new mongoose.Types.ObjectId(recipientId)];

    try {
        let conversation = await Conversation.findOne({
            participants: { $all: participantIds, $size: 2 },
        })
        .populate('participants', 'firstName lastName profilePicture email')
        .populate({
            path: 'lastMessage',
            select: 'content sender createdAt type mediaUrl',
            populate: {
                path: 'sender',
                select: 'firstName lastName',
            }
        });

        if (!conversation) {
            conversation = await Conversation.create({ participants: participantIds });
            conversation = await Conversation.findById(conversation._id)
                .populate('participants', 'firstName lastName profilePicture email');
        }

        res.json(conversation);
    } catch (error) {
        console.error('Error finding/creating conversation:', error);
        res.status(500).json({ message: error.message });
    }
};

const getMessages = async (req, res) => {
    const conversationId = req.params.id;

    try {
        const messages = await Message.find({ conversation: conversationId })
            .populate('sender', 'firstName lastName profilePicture email')
            .sort({ createdAt: 1 });

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
