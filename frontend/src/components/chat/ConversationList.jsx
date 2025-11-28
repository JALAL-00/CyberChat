// frontend/src/components/chat/ConversationList.jsx (UPDATED for Redux/Socket)

import { Search } from 'lucide-react';
// We'll define ChatUser and Conversation structure locally as Mongoose IDs are strings
const API_URL = import.meta.env.VITE_BACKEND_URL;

// --- Helper for profile image (from your previous code) ---
const AvatarFallback = ({ name, className }) => {
    const initial = (name || 'User').trim().charAt(0).toUpperCase();
    return (
        <div className={`flex items-center justify-center w-full h-full bg-blue-500 text-white ${className}`}>
            <span className="text-xl font-semibold">{initial}</span>
        </div>
    );
};
// ---------------------------------------------------------

const ConversationListItem = ({ user, isActive, isOnline, onUserClick }) => {
    return (
        <li
            key={user._id}
            onClick={() => onUserClick(user._id)} // Pass Mongoose _id
            className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center gap-3 transition-colors ${
                isActive ? 'bg-gray-200' : ''
            }`}
        >
            <div className="avatar relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                    {user.profilePicture ? (
                        <img src={`${API_URL}/uploads/${user.profilePicture}`} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                        <AvatarFallback name={`${user.firstName} ${user.lastName}`} className="rounded-full" />
                    )}
                </div>
                {isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
            </div>
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate">
                    {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 truncate">{/* Last message placeholder */}</p>
            </div>
        </li>
    );
};


export default function ConversationList({ users, activeConversation, currentUserId, onlineUsers, onUserClick, handleLogout }) {
    
    // Filter out the current user from the contact list
    const contacts = users.filter(u => u._id !== currentUserId);

    return (
        <aside className="w-full md:w-1/4 xl:w-1/5 flex flex-col border-r bg-white">
            <div className="p-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Contacts</h2>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-sm">Logout</button>
            </div>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" placeholder="Search users" className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            
            <ul className="overflow-y-auto flex-grow divide-y">
                {contacts.map(user => {
                    // Check if this user is the active conversation partner
                    const isActive = activeConversation?.participants.some(p => p._id === user._id) && 
                                     activeConversation.participants.length === 2; // Only for 1-to-1 chat

                    const isOnline = !!onlineUsers[user._id];

                    return (
                        <ConversationListItem
                            key={user._id}
                            user={user}
                            isActive={isActive}
                            isOnline={isOnline}
                            onUserClick={onUserClick}
                        />
                    );
                })}
            </ul>
        </aside>
    );
};