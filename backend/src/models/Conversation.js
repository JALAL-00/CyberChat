// backend/src/models/Conversation.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new mongoose.Schema({
    // participants is an array of User ObjectIds
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    // The last message in the conversation for the chat list preview
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {
    timestamps: true,
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;