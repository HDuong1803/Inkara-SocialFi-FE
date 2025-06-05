/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { IRoom } from '@/interfaces/room';
import { IConversation } from '@/interfaces/conversation';
import { toast } from 'react-toastify';
import { HOST_API } from '@/global-config';

const socket = io(`${HOST_API || 'http://localhost:8080'}/chat`, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
});

interface SocketContextType {
  socket: typeof socket;
  rooms: IRoom[];
  conversations: IConversation[];
  onlineUsers: { [userId: string]: boolean };
  setConversations: React.Dispatch<React.SetStateAction<IConversation[]>>;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [conversations, setConversations] = useState<IConversation[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });
    socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
    });
    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
      toast.error(`WebSocket error: ${err.message}`);
    });
    // socket.on('room:all', (rooms: IRoom[]) => {
    //   console.log('Received rooms:', rooms);
    //   setRooms(rooms);
    // });
    socket.on('conversation:all', (conversations: IConversation[]) => {
      console.log('Received conversations:', conversations);
      setConversations(conversations);
    });
    socket.on('error', (error: { event: string; message: string }) => {
      console.error(`Error in ${error.event}: ${error.message}`);
      toast.error(`Socket error: ${error.message}`);
    });
    socket.on('error:conversation-create', (error: { message: string }) => {
      console.error('Conversation create error:', error.message);
      toast.error(`Failed to start conversation: ${error.message}`);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('room:all');
      socket.off('conversation:all');
      socket.off('error');
      socket.off('error:conversation-create');
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, rooms, conversations, onlineUsers, setConversations }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};