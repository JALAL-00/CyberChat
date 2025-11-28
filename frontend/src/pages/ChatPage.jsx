import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { fetchUsers, loadConversation } from '../redux/slices/chatSlice';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import ConversationDetails from '../components/chat/ConversationDetails';

const ChatPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { users, activeConversation, messages, isLoading } = useSelector(state => state.chat);
  const { isConnected, onlineUsers, socket } = useSelector(state => state.socket);

  useEffect(() => {
    if (user) {
        dispatch(fetchUsers());
    }
  }, [user, dispatch]);
  
  const handleSelectConversation = (recipientId) => {
    const currentRecipientId = activeConversation?.participants?.find(p => p._id !== user._id)?._id;
    if (currentRecipientId !== recipientId) {
        dispatch(loadConversation(recipientId));
    }
  };

  const handleSendMessage = ({ content, type, mediaUrl }) => {
    if (activeConversation && socket) {
      socket.emit('message-sent', {
        conversationId: activeConversation._id,
        content,
        type,
        mediaUrl,
      });
    }
  };

  if (isLoading && users.length === 0) {
    return <div className="h-screen flex items-center justify-center">Loading Contacts...</div>;
  }

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <ConversationList
          users={users}
          activeConversation={activeConversation}
          currentUserId={user?._id}
          onlineUsers={onlineUsers}
          onUserClick={handleSelectConversation}
          handleLogout={() => dispatch(logout())}
        />
        <ChatWindow
          activeConversation={activeConversation}
          messages={messages}
          currentUserId={user?._id}
          onSendMessage={handleSendMessage}
          socket={socket}
        />
      </div>
    </div>
  );
};

export default ChatPage;
