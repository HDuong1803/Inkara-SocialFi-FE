import { useCallback, useEffect, useRef, useState } from 'react';
import { IMessage } from '@/interfaces/message';
import { useSocket } from '@/context/socket-context';
import { getMessageConversation } from '@/apis/message';

export const useConversation = (conversationId?: string) => {
  const { socket, conversations } = useSocket();
  const [localMessages, setLocalMessages] = useState<IMessage[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Dùng ref để ngăn useEffect gọi nhiều lần
  const hasInitializedRef = useRef(false);

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

  // Load ban đầu khi chọn conversation
  useEffect(() => {
    if (!conversationId || hasInitializedRef.current) return;

    hasInitializedRef.current = true; // chỉ chạy 1 lần
    setLocalMessages([]);
    setPage(1);
    setHasMore(true);

    loadMessages(1);
    socket.emit('conversation:join', { conversationId, page: 1, limit: 20 });

    const handleInitialMessages = (msgs: IMessage[]) => {
      if (msgs.length > 0) {
        setLocalMessages(msgs);
        setHasMore(msgs.length === 20);
      } else {
        setHasMore(false);
      }
    };

    const handleNewMessage = (message: IMessage) => {
      if (message.conversationId === conversationId) {
        setLocalMessages((prev) => [...prev, message]);
      }
    };

    socket.on('conversation:messages', handleInitialMessages);
    socket.on('message:created', handleNewMessage);

    return () => {
      socket.off('conversation:messages', handleInitialMessages);
      socket.off('message:created', handleNewMessage);
      hasInitializedRef.current = false;
    };
  }, [conversationId, socket, loadMessages]);

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
    if (!hasMore) return;

    const nextPage = page + 1;
    setPage(nextPage);
    loadMessages(nextPage);

    socket.emit('conversation:join', {
      conversationId,
      page: nextPage,
      limit: 20,
    });
  };

  return {
    messages: localMessages,
    conversations,
    sendMessage,
    loadMoreMessages,
    hasMore,
  };
};
