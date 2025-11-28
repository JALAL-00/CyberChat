// frontend/src/types/chat.js (For structural clarity)

// Corresponds to backend User Model (public facing)
export const ChatUser = {
    _id: String,
    firstName: String,
    lastName: String,
    email: String,
    profilePicture: String,
};

// Corresponds to backend Message Model
export const Message = {
    _id: String,
    sender: ChatUser,
    content: String,
    createdAt: Date,
    conversation: String, // ID of conversation
    type: 'text' | 'image' | 'video' | 'file',
    mediaUrl: String | null,
};

// Corresponds to backend Conversation Model
export const Conversation = {
    _id: String,
    participants: [ChatUser],
    lastMessage: Message | null,
    createdAt: Date,
    updatedAt: Date,
};