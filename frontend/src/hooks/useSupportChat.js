import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const useSupportChat = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChat = useCallback(async () => {
    if (!chatId) return;
    try {
      const { data } = await api.get(`/support/chat/${chatId}`);
      setMessages(data.data.messages);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch chat');
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  const pollMessages = useCallback(async () => {
    if (!chatId || messages.length === 0) return;
    const lastTimestamp = messages[messages.length - 1].createdAt;
    try {
      const { data } = await api.get(`/support/chat/${chatId}/poll?after=${lastTimestamp}`);
      if (data.data.length > 0) {
        setMessages(prev => [...prev, ...data.data]);
      }
    } catch (err) {
      console.error('Polling failed', err);
    }
  }, [chatId, messages]);

  useEffect(() => {
    fetchChat();
  }, [fetchChat]);

  useEffect(() => {
    if (chatId) {
      const interval = setInterval(pollMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, pollMessages]);

  const sendMessage = async (text) => {
    try {
      const { data } = await api.post(`/support/chat/${chatId}/message`, { text });
      // Message will be added via polling or optimistic update
      setMessages(prev => [...prev, data.data]);
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  return { messages, loading, error, sendMessage, refreshChat: fetchChat };
};

export default useSupportChat;
