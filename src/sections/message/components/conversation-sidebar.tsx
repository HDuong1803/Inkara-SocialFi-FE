import React, { useEffect, useState } from 'react';
import { useSocket } from '@/context/socket-context';
import { getManyUser } from '@/apis/user';
import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { Typography } from '@/components/typography';
import { toast } from 'react-toastify';

interface User {
  id: string;
  fullname: string;
  address: string;
  photo?: { url: string };
}

export default function ConversationSidebar({
  onConversationClick,
}: { onConversationClick: (id: string) => void }) {
  const { socket, conversations } = useSocket();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isUsersLoaded, setIsUsersLoaded] = useState<boolean>(false);
  const fetchUsers = async () => {
    if (isUsersLoaded) return;
    try {
      const res = await getManyUser();
      setUsers(res.data);
      setIsUsersLoaded(true);
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users');
    }
  };

  const handleDropdownOpen = () => {
    if (!isUsersLoaded) {
      fetchUsers();
    }
  };

  const handleStartConversation = () => {
    if (selectedUserId) {
      socket.emit('conversation:create', { id: selectedUserId });
    }
  };

  useEffect(() => {
    socket.emit('conversation:all')
  }, [socket])

  return (
    <div className="w-full lg:w-1/4 h-full bg-surface-2 p-4">
      <Typography level="h5" className="text-gray-100 mb-4">
        Conversations
      </Typography>
      <div className="mb-4">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          onFocus={handleDropdownOpen} // Gọi API khi mở dropdown
          className="w-full px-4 py-2 rounded-[20px] bg-surface-2 text-gray-100"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.address}>
              {user.fullname || user.address}
            </option>
          ))}
        </select>
        <Button
          onClick={handleStartConversation}
          disabled={!selectedUserId}
          className="mt-2 w-full bg-gradient-to-r from-cherry to-black-600 text-white rounded-full shadow-md disabled:cursor-not-allowed"
          child={<span className="text-base">Start Conversation</span>}
        >
          Start New Conversation
        </Button>
      </div>
      {conversations.length === 0 ? (
        <Typography level="base2sm" className="text-gray-400">
          No conversations yet.
        </Typography>
      ) : (
        conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onConversationClick(conv.id)}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-neutral2-5 cursor-pointer transition-all duration-300"
          >
            <Avatar
              src={conv.recipient.photo?.url || ''}
              alt={conv.recipient.fullname || 'avatar'}
              size={40}
            />
            <div className="flex flex-col justify-center flex-1">
              <div className="flex justify-between w-full">
              <Typography level="baser" className="text-gray-100">
                {conv.recipient.fullname || conv.recipient.address}
              </Typography>
              <Typography level="base2r" className="text-gray-400">
                {conv.recipient.address.slice(0, 6)}...
                {conv.recipient.address.slice(-4)}
              </Typography>
              </div>
              <div className="flex justify-between w-full">
              <Typography level="base2r" className="text-gray-400 truncate max-w-[70%]">
                {conv.messages[0]?.text 
                  ? (conv.messages[0].text.length > 10 
                     ? conv.messages[0].text.substring(0, 20) + '...' 
                     : conv.messages[0].text) 
                  : 'No messages yet'}
              </Typography>
              <Typography level="base2r" className="text-gray-400">
                {conv.messages[0]?.createdAt ? new Date(conv.messages[0].createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''}
              </Typography>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}