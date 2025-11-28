// frontend/src/components/chat/ChatWindow.jsx (UPDATED for Typing Indicator)

import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Phone, Video, MoreHorizontal } from 'lucide-react';

// --- Your Existing Imports ---
// We will move AvatarFallback and MessageBubble into the same file for now to save time
const API_URL = import.meta.env.VITE_BACKEND_URL; 

// --- Helper Functions and Components (Simplified versions for Mongoose) ---
const AvatarFallback = ({ name, className }) => {
    const initial = (name || 'User').trim().charAt(0).toUpperCase();
    return (
        <div className={`flex items-center justify-center w-full h-full bg-blue-500 text-white ${className}`}>
            <span className="text-xl font-semibold">{initial}</span>
        </div>
    );
};

const MessageBubble = ({ message, currentUserId }) => {
    const isSender = message.sender._id === currentUserId;
    // ... (rest of renderContent from your previous code - ASSUMED CORRECT) ...
    const renderContent = () => {
        // ... (Implement your full render logic here for text, image, file, etc.)
        return (
            <div className={`p-2 rounded-lg max-w-xs break-words ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                {message.content || `[${message.type.toUpperCase()} MESSAGE]`}
            </div>
        );
    };

    return (
        <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start gap-3 max-w-3/4 ${isSender ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                    {message.sender.profilePicture ? (
                        <img src={`${API_URL}/uploads/${message.sender.profilePicture}`} alt={message.sender.firstName} className="w-full h-full object-cover" />
                    ) : (
                        <AvatarFallback name={`${message.sender.firstName} ${message.sender.lastName}`} className="rounded-full" />
                    )}
                </div>
                <div>
                    <div className={`text-xs ${isSender ? 'text-right' : 'text-left'} text-gray-500 mb-1`}>
                        {message.sender.firstName} - {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

// --- MessageInput Component (Needs the typing logic) ---
const MessageInput = ({ onSendMessage, activeConversationId, socket, currentUserId }) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const typingTimeoutRef = useRef(null);

    // Function to handle typing event emission
    const handleInputChange = (e) => {
        setText(e.target.value);

        if (!socket || !activeConversationId) return;

        // 1. Emit typing-start if not already typing
        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing-start', { conversationId: activeConversationId });
        }

        // 2. Clear previous timeout
        clearTimeout(typingTimeoutRef.current);

        // 3. Set a new timeout to emit typing-stop after a short delay
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing-stop', { conversationId: activeConversationId });
        }, 3000); // Stop after 3 seconds of no input
    };

    const handleSendText = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onSendMessage({ content: text, type: 'text', mediaUrl: null });
            setText('');
            
            // Immediately stop typing after sending message
            if (isTyping && socket && activeConversationId) {
                clearTimeout(typingTimeoutRef.current);
                setIsTyping(false);
                socket.emit('typing-stop', { conversationId: activeConversationId });
            }
        }
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => clearTimeout(typingTimeoutRef.current);
    }, []);

    return (
        <form onSubmit={handleSendText} className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                {/* File input omitted for simplicity, but your previous code should be used here */}
                <input
                    type="text"
                    value={text}
                    onChange={handleInputChange} // Use the new handler
                    placeholder="Type a message..."
                    className="flex-grow p-2 focus:outline-none"
                />
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                    Send
                </button>
            </div>
        </form>
    );
};
// -------------------------------------------------------------


export default function ChatWindow({ activeConversation, messages, currentUserId, onSendMessage, socket }) {
  const messagesEndRef = useRef(null);
  const { typingUsers } = useSelector(state => state.chat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeConversation || !currentUserId) {
    return (
      <main className="w-full md:w-3/4 xl:w-4/5 flex items-center justify-center h-full text-gray-500 bg-gray-100">
        <p>Select a contact to start chatting.</p>
      </main>
    );
  }

  const otherParticipant = activeConversation.participants.find(p => p._id !== currentUserId);
  const typingUserIds = typingUsers[activeConversation._id] || [];
  const isTyping = typingUserIds.some(id => id === otherParticipant._id);


  return (
    <main className="w-full md:w-3/4 xl:w-4/5 flex flex-col bg-white border-l">
      <header className="flex items-center justify-between p-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
             {otherParticipant?.profilePicture ? (
                <img src={`${API_URL}/uploads/${otherParticipant.profilePicture}`} alt={otherParticipant.firstName} className="w-full h-full object-cover" />
             ) : (
                <AvatarFallback name={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`} className="rounded-full" />
             )}
          </div>
          <div>
            <p className="font-bold">{otherParticipant?.firstName} {otherParticipant?.lastName}</p>
            {isTyping && <p className="text-xs text-green-500">Typing...</p>} {/* TYPING INDICATOR */}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-full hover:bg-gray-100"><Phone size={20} /></button>
          <button className="p-2 rounded-full hover:bg-gray-100"><Video size={20} /></button>
          <button className="p-2 rounded-full hover:bg-gray-100"><MoreHorizontal size={20} /></button>
        </div>
      </header>

      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-gray-100">
        {messages.map((msg) => (
          <MessageBubble key={msg._id} message={msg} currentUserId={currentUserId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput 
        onSendMessage={onSendMessage} 
        activeConversationId={activeConversation._id}
        socket={socket} 
        currentUserId={currentUserId}
      />
    </main>
  );
};