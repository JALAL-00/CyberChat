export const ChatUser = {
    _id: String,
    firstName: String,
    lastName: String,
    email: String,
    profilePicture: String,
};

export const Message = {
    _id: String,
    sender: ChatUser,
    content: String,
    createdAt: Date,
    conversation: String,
    type: 'text' | 'image' | 'video' | 'file',
    mediaUrl: String | null,
};

export const Conversation = {
    _id: String,
    participants: [ChatUser],
    lastMessage: Message | null,
    createdAt: Date,
    updatedAt: Date,
};
