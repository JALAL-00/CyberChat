import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Phone, Video, MoreHorizontal, Paperclip, Send, File, Image as ImageIcon } from 'lucide-react';
import { uploadChatFile } from '../../api/apiService';

const API_URL = import.meta.env.VITE_BACKEND_URL;

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
    
    const renderContent = () => {
        const mediaUrl = message.mediaUrl ? `${API_URL}/${message.mediaUrl}` : null;

        switch (message.type) {
            case 'image':
                return (
                    <div className="max-w-xs cursor-pointer" onClick={() => window.open(mediaUrl, '_blank')}>
                        <img 
                            src={mediaUrl} 
                            alt="Image media" 
                            className="rounded-lg object-cover max-h-64" 
                            loading="lazy"
                        />
                    </div>
                );
            case 'video':
                return (
                    <video controls className="rounded-lg max-w-sm max-h-64">
                        <source src={mediaUrl} />
                        Your browser does not support the video tag.
                    </video>
                );
            case 'file':
                return (
                    <a
                        href={mediaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 p-3 rounded-lg max-w-xs transition-colors ${
                            isSender ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
                        }`}
                    >
                        <File size={24} />
                        <span className="font-semibold">{message.content || 'Download File'}</span>
                    </a>
                );
            case 'text':
            default:
                return (
                    <div className={`p-2 rounded-lg max-w-xs break-words ${isSender ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                        {message.content}
                    </div>
                );
        }
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

const MessageInput = ({ onSendMessage, activeConversationId, socket, currentUserId }) => {
    const [text, setText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const typingTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        clearTimeout(typingTimeoutRef.current);
        
        try {
            const { filePath, fileName, fileType } = await uploadChatFile(file);
            
            let type = 'file';
            if (fileType.startsWith('image/')) type = 'image';
            if (fileType.startsWith('video/')) type = 'video';
            
            onSendMessage({ 
                content: fileName, 
                type: type, 
                mediaUrl: filePath 
            });

        } catch (error) {
            console.error("File upload failed:", error);
            alert(`File upload failed. Max size 50MB. Error: ${error.message || 'Unknown error'}`);
        } finally {
            setIsUploading(false);
            if(fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleInputChange = (e) => {
        setText(e.target.value);

        if (!socket || !activeConversationId) return;

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing-start', { conversationId: activeConversationId });
        }

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('typing-stop', { conversationId: activeConversationId });
        }, 3000);
    };

    const handleSendText = (e) => {
        e.preventDefault();
        if (text.trim() && !isUploading) { 
            onSendMessage({ content: text, type: 'text', mediaUrl: null });
            setText('');
            
            if (isTyping && socket && activeConversationId) {
                clearTimeout(typingTimeoutRef.current);
                setIsTyping(false);
                socket.emit('typing-stop', { conversationId: activeConversationId });
            }
        }
    };

    useEffect(() => {
        return () => clearTimeout(typingTimeoutRef.current);
    }, []);

    return (
        <form onSubmit={handleSendText} className="p-4 border-t bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                <button type="button" 
                        className="p-2 text-gray-500 hover:text-blue-500" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                >
                    <Paperclip size={20} />
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

                <input
                    type="text"
                    value={text}
                    onChange={handleInputChange}
                    placeholder={isUploading ? "Uploading file..." : "Type a message..."}
                    className="flex-grow p-2 focus:outline-none"
                    disabled={isUploading}
                />

                <button type="submit" 
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        disabled={isUploading || text.trim() === ''} 
                >
                    {isUploading ? '...' : <Send size={20} />}
                </button>
            </div>
        </form>
    );
};

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
            {isTyping && <p className="text-xs text-green-500">Typing...</p>}
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
          <MessageBubble key={msg._1 || msg._id} message={msg} currentUserId={currentUserId} />
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
