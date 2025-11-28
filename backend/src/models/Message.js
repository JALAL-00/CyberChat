// backend/src/models/Message.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const MessageSchema = new mongoose.Schema({
    conversation: {
        type: Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: function() {
            // Content is only required if it's a TEXT message and no media is present
            return this.type === 'text' && !this.mediaUrl;
        },
        default: null, // Allow null for media messages
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'file'],
        default: 'text',
    },
    mediaUrl: {
        type: String,
        default: null, // Path to the uploaded file
    }
}, {
    timestamps: true,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;