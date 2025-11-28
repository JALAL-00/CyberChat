import React from 'react';
import { Bell, Pin, UserPlus, Settings } from 'lucide-react';

export default function ConversationDetails({ activeConversation }) {
  if (!activeConversation) return <aside className="hidden xl:w-1/4 xl:flex"></aside>;

  return (
    <aside className="hidden xl:w-1/4 xl:flex flex-col border-l bg-white p-4">
      <h3 className="text-lg font-bold text-center mb-4">Conversation Details</h3>
      <div className="flex justify-around items-center mb-6">
        <button className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell size={20}/> <span className="text-xs">Notification</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Pin size={20}/> <span className="text-xs">Pin Conversation</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <UserPlus size={20}/> <span className="text-xs">Member</span>
        </button>
        <button className="flex flex-col items-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={20}/> <span className="text-xs">Setting</span>
        </button>
      </div>

      <div className="space-y-6 overflow-y-auto">
        <div>
          <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">Images</h4><a href="#" className="text-sm text-blue-500 hover:underline">View All</a></div>
          <p className="text-sm text-gray-500">No images shared yet.</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">Files</h4><a href="#" className="text-sm text-blue-500 hover:underline">View All</a></div>
          <p className="text-sm text-gray-500">No files shared yet.</p>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2"><h4 className="font-semibold">Links</h4><a href="#" className="text-sm text-blue-500 hover:underline">View All</a></div>
          <p className="text-sm text-gray-500">No links shared yet.</p>
        </div>
      </div>
    </aside>
  );
};
