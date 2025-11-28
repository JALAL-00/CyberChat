const mongoose = require('mongoose');
const { Schema } = mongoose;

const ConversationSchema = new mongoose.Schema({
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
}, {
    timestamps: true,
});

const Conversation = mongoose.model('Conversation', ConversationSchema);

module.exports = Conversation;
