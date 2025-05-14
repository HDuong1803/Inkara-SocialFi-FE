import { useCallback, useEffect, useState } from 'react';
import { IMessage } from '@/interfaces/message';
import { useSocket } from '@/context/socket-context';
import { getMessageConversation } from '@/apis/message';

export const useConversation = (conversationId?: string) => {
  const { socket, conversations } = useSocket();
  const [localMessages, setLocalMessages] = useState<IMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMessages = useCallback(
    async (pageToLoad: number) => {
      if (!conversationId) return;

      try {
        const response = await getMessageConversation(conversationId, pageToLoad, 20);
        const apiMessages = response.data || [];

        if (apiMessages.length === 0) {
          setHasMore(false);
          return;
        }

        setLocalMessages((prev) =>
          pageToLoad === 1 ? apiMessages : [...apiMessages, ...prev]
        );
      } catch (err) {
        console.error('Failed to load messages:', err);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (!conversationId) return;

    loadMessages(1);

    socket.emit('conversation:join', { conversationId, page: 1, limit: 20 });

    socket.on('conversation:messages', (msgs: IMessage[]) => {
      if (msgs.length > 0) {
        setLocalMessages((prev) => (page === 1 ? msgs : [...msgs, ...prev]));
        setHasMore(msgs.length === 20);
      } else {
        setHasMore(false);
      }
    });

    socket.on('message:created', (message: IMessage) => {
      if (message.conversationId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off('conversation:messages');
      socket.off('message:created');
    };
  }, [conversationId, socket, page, loadMessages]);

  const sendMessage = (message: string) => {
    if (conversationId) {
      socket.emit('message:create', {
        message,
        chatId: conversationId,
        type: 'conversation',
      });
    }
  };

  const loadMoreMessages = () => {
    if (hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadMessages(nextPage);
      socket.emit('conversation:join', {
        conversationId,
        page: nextPage,
        limit: 20,
      });
    }
  };

  return {
    messages: localMessages,
    conversations,
    sendMessage,
    loadMoreMessages,
    hasMore,
  };
};