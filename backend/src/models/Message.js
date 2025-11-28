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
            return this.type === 'text' && !this.mediaUrl;
        },
        default: null,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'video', 'file'],
        default: 'text',
    },
    mediaUrl: {
        type: String,
        default: null,
    }
}, {
    timestamps: true,
});

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;
