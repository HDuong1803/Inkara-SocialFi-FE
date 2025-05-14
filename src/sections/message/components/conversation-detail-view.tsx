'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/avatar';
import { CloseIcon, MoreIcon } from '@/components/icons';
import { Typography } from '@/components/typography';
import { Button } from '@/components/button';
import { useConversation } from '@/routes/hooks/use-conversation';
import { useSocket } from '@/context/socket-context';
import MessageItem from './message-item';
import ChatInput from './chat-input';

type ConversationDetailProps = {
  id: string;
};

export default function ConversationDetail({ id }: ConversationDetailProps) {
  const router = useRouter();
  const { socket, conversations } = useSocket();
  const { messages, sendMessage, loadMoreMessages, hasMore } = useConversation(id);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const conversation = conversations.find((conv) => conv.id === id);
  const observerRef = useRef<HTMLDivElement | null>(null);
  console.log('Type:', typeof messages);
  console.log('Messages in ConversationDetail:', messages);

  useEffect(() => {
    socket.on('typing', ({ userId, chatId }: { userId: string; chatId: string }) => {
      if (chatId === id) {
        setTypingUser(userId);
        setTimeout(() => setTypingUser(null), 3000);
      }
    });

    return () => {
      socket.off('typing');
    };
  }, [socket, id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreMessages();
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasMore, loadMoreMessages]);

  const handleBack = () => {
    router.push('/messages');
  };

  const handleTyping = (text: string) => {
    if (text.trim()) {
      socket.emit('typing', { chatId: id, type: 'conversation' });
    }
  };

  return (
    <section className="block md:hidden w-full h-full flex-col bg-surface lg:flex">
      <section
        id="conversation-header"
        className="w-full flex items-center gap-4 py-3 pr-6 pl-3 bg-neutral2-3"
      >
        <Avatar
          src={conversation?.recipient.photo?.url || ''}
          alt={conversation?.recipient.fullname || 'avatar'}
          size={40}
        />
        <Typography level="base2m" className="text-gray-100 grow">
          {conversation?.recipient.fullname || conversation?.recipient.address}
        </Typography>
        <Button className="p-2.5 text-gray-400 hover:text-wine" child={<MoreIcon />} />
        <Button
          onClick={handleBack}
          className="p-2.5 text-gray-400 hover:text-wine lg:hidden"
          child={<CloseIcon />}
        />
      </section>

      <section
        id="chat-container"
        className="flex flex-col-reverse gap-2 h-[calc(100vh-150px)] overflow-y-auto items-center justify-start p-3"
      >
        {messages.map((message) => (
          <MessageItem key={message.id} message={message} />
        ))}
        {hasMore && <div ref={observerRef} className="h-10" />}
        {typingUser && (
          <Typography level="small" className="text-gray-400 italic">
            User is typing...
          </Typography>
        )}
      </section>

      <ChatInput onSendMessage={sendMessage} onTyping={handleTyping} />
    </section>
  );
}